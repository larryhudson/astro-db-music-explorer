import { lucia } from "@src/auth";
import { Argon2id } from "oslo/password";
import { db, User, eq } from "astro:db";

export async function POST(context) {

  const jsonData = await context.request.json();

  console.log("Got here");
  console.log(jsonData);

  const username = jsonData.username;
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return new Response("Invalid username", {
      status: 400,
    });
  }
  const password = jsonData.password;
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new Response("Invalid password", {
      status: 400,
    });
  }

  const existingUsers = await db
    .select()
    .from(User)
    .where(eq(User.username, username));

  const existingUser = existingUsers[0];

  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is none-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    return new Response("Incorrect username or password", {
      status: 400,
    });
  }

  console.log({ existingUser });

  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword,
    password,
  );

  if (!validPassword) {
    return new Response("Incorrect username or password", {
      status: 400,
    });
  }

  const userId = existingUser.id;

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  console.log({ sessionCookie });

  return new Response(JSON.stringify({ sessionKeyValue: sessionCookie.value }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });

}
