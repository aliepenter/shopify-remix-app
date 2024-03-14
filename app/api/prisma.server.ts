import prisma from "~/db.server"
export const createPrisma = async ({ author, email, storeName, themeId}: any) => {
    const existRecord = await prisma.userSession.findFirst({
        where: {
            storeName: storeName
        }
    })
    if (!existRecord) {
        return await prisma.userSession.create({
            data: {
                themeAuthor: author,
                themeId: themeId,
                email: email,
                storeName: storeName
            } as any
        })
    }
}

export const updatePrismaAuthor = async ({ author, themeId, themeName, storeName, enableAppEmbed, customizeStatus }: any) => {
    const existingRecord = await prisma.userSession.findFirst({
        where: {
            storeName: storeName
        }
    });
    if (existingRecord) {
        return await prisma.userSession.update({
            where: {
                id: existingRecord.id
            },
            data: {
                themeAuthor: author,
                themeId: themeId,
                enableAppEmbed: enableAppEmbed,
                customizeStatus: customizeStatus,
                themeName: themeName
            } as any
        })
    }
}

export const getPrisma = async (themeName : string) => {
    return await prisma.userSession.findFirst({
        where: {
            storeName: themeName
        }
    })
}

export const getThemes = async (themeName : string) => {
    return await prisma.themes.findMany({
        where: {
            themeParent: themeName
        }
    })
}

export const getUpdateStatus = async () => {
    return await prisma.updateStatus.findFirst(
        {
            orderBy: {
                date: 'desc',
            }
        }
    );
} 