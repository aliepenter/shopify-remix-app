-- CreateTable
CREATE TABLE "userSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeAuthor" TEXT,
    "email" TEXT,
    "themeId" TEXT
);

-- CreateTable
CREATE TABLE "themes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeName" TEXT,
    "themeParent" TEXT,
    "themePreviewUrl" TEXT,
    "themeFolderPath" TEXT,
    "themePreviewImageUrl" TEXT
);

-- CreateTable
CREATE TABLE "updateStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeLogs" TEXT,
    "version" TEXT
);
