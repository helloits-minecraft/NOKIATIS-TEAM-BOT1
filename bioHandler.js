const bioDatabase = new Map(); // Temporary storage for bios

module.exports = {
    setBio: (userId, bio) => {
        bioDatabase.set(userId, bio);
    },
    getBio: (userId) => {
        return bioDatabase.get(userId) || null;
    }
};
