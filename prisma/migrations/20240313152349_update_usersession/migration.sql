-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_userSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeAuthor" TEXT,
    "themeName" TEXT,
    "email" TEXT,
    "themeId" TEXT,
    "enableAppEmbed" BOOLEAN NOT NULL DEFAULT false,
    "customizeStatus" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_userSession" ("email", "id", "themeAuthor", "themeId", "themeName") SELECT "email", "id", "themeAuthor", "themeId", "themeName" FROM "userSession";
DROP TABLE "userSession";
ALTER TABLE "new_userSession" RENAME TO "userSession";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
