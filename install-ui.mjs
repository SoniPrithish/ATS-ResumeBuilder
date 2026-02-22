import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const components = [
    'button', 'card', 'dialog', 'dropdown-menu', 'form',
    'input', 'label', 'progress', 'select', 'separator',
    'skeleton', 'table', 'tabs', 'textarea', 'sonner', 'tooltip'
];

async function install() {
    const uiDir = path.join(process.cwd(), 'src', 'components', 'ui');
    if (!fs.existsSync(uiDir)) {
        fs.mkdirSync(uiDir, { recursive: true });
    }

    const dependencies = new Set();

    for (const comp of components) {
        console.log(`Fetching ${comp}...`);
        try {
            const resp = await fetch(`https://ui.shadcn.com/r/styles/new-york/${comp}.json`);
            const data = await resp.json();

            for (const file of data.files) {
                const fileName = file.path.split('/').pop();
                fs.writeFileSync(path.join(uiDir, fileName), file.content);
            }

            if (data.dependencies) {
                data.dependencies.forEach(d => dependencies.add(d));
            }
            if (data.devDependencies) {
                data.devDependencies.forEach(d => dependencies.add(d));
            }
        } catch (e) {
            console.error(`Failed to fetch ${comp}:`, e.message);
        }
    }

    const depsArray = Array.from(dependencies);
    if (depsArray.length > 0) {
        console.log('Installing dependencies:', depsArray.join(' '));
        execSync(`pnpm install ${depsArray.join(' ')}`, { stdio: 'inherit' });
    }
}

install();
