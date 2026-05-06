const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', '@types');

const removeNestedReactTypes = (packageDir) => {
    const nestedTypesDir = path.join(packageDir, 'node_modules', '@types');

    if (!fs.existsSync(nestedTypesDir)) {
        return;
    }

    for (const packageName of ['react', 'react-dom']) {
        const target = path.join(nestedTypesDir, packageName);

        if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true });
        }
    }

    for (const entry of fs.readdirSync(nestedTypesDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }

        removeNestedReactTypes(path.join(nestedTypesDir, entry.name));
    }
};

if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }

        removeNestedReactTypes(path.join(root, entry.name));
    }
}
