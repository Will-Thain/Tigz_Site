import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  pollOptions as pollOptionsTable,
  pollVotes as pollVotesTable,
  polls as pollsTable,
} from "@/db/schema";
import { readStore, writeStore } from "@/lib/store";
import { pollIsOpen, polls as seedPolls, type Poll } from "@/data/polls";

type StoredVote = {
  id: string;
  pollId: string;
  optionId: string;
  voterKey: string;
  createdAt: string;
};

function normalizePolls(rows: Poll[]): Poll[] {
  return rows.map((poll) => ({
    ...poll,
    active: poll.active !== false,
    closesAt: poll.closesAt ?? "",
    options: (poll.options ?? []).map((opt) => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes ?? 0,
    })),
  }));
}

async function loadPollsFromStore() {
  return normalizePolls(await readStore<Poll[]>("polls", seedPolls));
}

export async function loadPolls(): Promise<Poll[]> {
  const db = getDb();
  if (!db) return loadPollsFromStore();

  const [pollRows, optionRows] = await Promise.all([
    db.select().from(pollsTable),
    db.select().from(pollOptionsTable),
  ]);

  return pollRows.map((row) => ({
    id: row.id,
    question: row.question,
    closesAt: row.closesAt ? row.closesAt.toISOString() : "",
    active: row.active,
    options: optionRows
      .filter((opt) => opt.pollId === row.id)
      .map((opt) => ({ id: opt.id, label: opt.label, votes: opt.votes })),
  }));
}

export async function createPoll(input: {
  question: string;
  closesAt: string;
  options: string[];
}): Promise<Poll> {
  const id = randomUUID();
  const optionRows = input.options.map((label) => ({
    id: randomUUID(),
    label,
    votes: 0,
  }));
  const poll: Poll = {
    id,
    question: input.question,
    closesAt: input.closesAt,
    active: true,
    options: optionRows,
  };

  const db = getDb();
  if (db) {
    await db.insert(pollsTable).values({
      id,
      question: input.question,
      closesAt: input.closesAt ? new Date(input.closesAt) : null,
      active: true,
    });
    await db.insert(pollOptionsTable).values(
      optionRows.map((opt) => ({
        id: opt.id,
        pollId: id,
        label: opt.label,
        votes: 0,
      })),
    );
    return poll;
  }

  const current = await loadPollsFromStore();
  current.push(poll);
  await writeStore("polls", current);
  return poll;
}

export async function closePoll(id: string): Promise<Poll[]> {
  const db = getDb();
  if (db) {
    await db.update(pollsTable).set({ active: false }).where(eq(pollsTable.id, id));
    return loadPolls();
  }

  const current = (await loadPollsFromStore()).map((poll) =>
    poll.id === id ? { ...poll, active: false } : poll,
  );
  await writeStore("polls", current);
  return current;
}

export async function votePoll(
  pollId: string,
  optionId: string,
  voterKey: string,
): Promise<{ ok: boolean; error?: string; polls: Poll[] }> {
  const db = getDb();
  if (db) {
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId)).limit(1);
    if (!poll) return { ok: false, error: "Poll not found.", polls: await loadPolls() };
    const mapped: Poll = {
      id: poll.id,
      question: poll.question,
      closesAt: poll.closesAt ? poll.closesAt.toISOString() : "",
      active: poll.active,
      options: [],
    };
    if (!pollIsOpen(mapped)) return { ok: false, error: "Poll is closed.", polls: await loadPolls() };

    const [option] = await db
      .select()
      .from(pollOptionsTable)
      .where(and(eq(pollOptionsTable.id, optionId), eq(pollOptionsTable.pollId, pollId)))
      .limit(1);
    if (!option) return { ok: false, error: "Invalid option.", polls: await loadPolls() };

    const existing = await db
      .select()
      .from(pollVotesTable)
      .where(and(eq(pollVotesTable.pollId, pollId), eq(pollVotesTable.voterKey, voterKey)))
      .limit(1);
    if (existing.length) return { ok: false, error: "Already voted.", polls: await loadPolls() };

    await db.insert(pollVotesTable).values({
      id: randomUUID(),
      pollId,
      optionId,
      voterKey,
      createdAt: new Date(),
    });
    await db
      .update(pollOptionsTable)
      .set({ votes: sql`${pollOptionsTable.votes} + 1` })
      .where(eq(pollOptionsTable.id, optionId));
    return { ok: true, polls: await loadPolls() };
  }

  const current = await loadPollsFromStore();
  const votes = await readStore<StoredVote[]>("pollVotes", []);
  const poll = current.find((row) => row.id === pollId);
  if (!poll) return { ok: false, error: "Poll not found.", polls: current };
  if (!pollIsOpen(poll)) return { ok: false, error: "Poll is closed.", polls: current };
  if (!poll.options.some((opt) => opt.id === optionId)) {
    return { ok: false, error: "Invalid option.", polls: current };
  }
  if (votes.some((vote) => vote.pollId === pollId && vote.voterKey === voterKey)) {
    return { ok: false, error: "Already voted.", polls: current };
  }

  const nextPolls = current.map((row) => {
    if (row.id !== pollId) return row;
    return {
      ...row,
      options: row.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
      ),
    };
  });
  await writeStore("polls", nextPolls);
  await writeStore("pollVotes", [
    ...votes,
    {
      id: randomUUID(),
      pollId,
      optionId,
      voterKey,
      createdAt: new Date().toISOString(),
    },
  ]);
  return { ok: true, polls: nextPolls };
}
