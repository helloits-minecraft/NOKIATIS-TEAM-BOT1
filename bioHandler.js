const bioDatabase = new Map(); // Temporary storage for bios

const requiredBio = "Verified User"; // 👈 Change this to the bio members must set

module.exports = {
    setBio: (userId, bio) => {
        bioDatabase.set(userId, bio);
    },
    getBio: (userId) => {
        return bioDatabase.get(userId) || null;
    },
    isBioValid: (userId) => {
        return bioDatabase.get(userId) === requiredBio; // 👈 Checks if user's bio matches
    }
};
