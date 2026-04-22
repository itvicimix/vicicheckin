@echo off
mkdir temp_configs
move README.md temp_configs\
move tailwind.config.ts temp_configs\
move playwright.config.ts temp_configs\

call npx -y create-next-app@latest booking-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

xcopy booking-app . /E /I /H /Y
rmdir /S /Q booking-app

move /Y temp_configs\* .
rmdir temp_configs

call npm install lucide-react framer-motion zustand firebase
call npm install -D @playwright/test @types/node
