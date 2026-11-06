# Contributing

感谢参与开发。提交改动前请先阅读以下约定。

## 开发流程

1. 从 `main` 新建功能分支：
   ```powershell
   git switch -c feature/short-name
   ```
2. 修改后运行基础检查：
   ```powershell
   node --check web/game.js
   ```
3. 如果修改了存档服务，重新编译：
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .	oolsuild-server.ps1
   ```
4. 提交前检查变更，不要把个人存档和构建产物加入 Git：
   ```powershell
   git status
   git diff --stat
   ```
5. 提交信息建议使用简短的英文或中文描述，例如：
   - `feat: add new elite attack pattern`
   - `fix: isolate per-save run history`
   - `ui: improve small-screen settings layout`

## 代码与文案规范

- 面向玩家的提示应简洁、直接，不出现开发者术语、状态机名称、变量名或实现细节。
- 不要加入“AI 提示”“版本更新说明”或自我解释式文字。
- 保持长征主题、历史来源和非官方课程实践定位。
- 新增历史内容前先核对 `docs/历史资料来源.md`，虚构玩法不能冒充具体史实。
- 新增素材必须记录来源或明确为项目原创。
- 地图相关内容应避免错误边界和未经审图的国家版图表达。

## 存档与测试数据

- 正式存档目录：`%USERPROFILE%\Documents\长征·星火征途存档`
- 项目目录中的 `web/存档/` 仅用于本地测试，不应提交。
- 测试台和正式对局必须保持数据隔离。
