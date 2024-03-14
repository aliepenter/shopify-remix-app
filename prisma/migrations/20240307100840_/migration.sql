/*
  Warnings:

  - You are about to drop the column `themename` on the `userSession` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_userSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeAuthor" TEXT,
    "themeName" TEXT,
    "email" TEXT,
    "themeId" TEXT
);
INSERT INTO "new_userSession" ("email", "id", "themeAuthor", "themeId") SELECT "email", "id", "themeAuthor", "themeId" FROM "userSession";
DROP TABLE "userSession";
ALTER TABLE "new_userSession" RENAME TO "userSession";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
