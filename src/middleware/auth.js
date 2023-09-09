const fs = require('fs');

const getUsers = () => {
    try {
        const arquivo = fs.readFileSync("./src/data/users.json", "utf-8");

        const parsedArquivo = JSON.parse(arquivo);

        return parsedArquivo.users;
    } catch (error) {
        return [];
    }
}

module.exports = getUsers; 