# Cloud Studio Demo
这是一个 Cloud Studio 自动预览的 Demo。之所以自动运行了这个应用并打开了预览窗口，是因为有 `.vscode/preview.yml` 文件存在。

该文件的格式说明如下：
```yml
# .vscode/preview.yml
autoOpen: true # 打开工作空间时是否自动开启所有应用的预览
apps:
  - port: 9000 # 应用的端口
    run: node app # 应用的启动命令
    root: ./app # 应用的启动目录
    name: Node.js Cloud Studio Demo # 应用名称
    description: Node.js Cloud Studio Demo # 应用描述
    autoOpen: true # 打开工作空间时是否自动开启预览（优先级高于根级 autoOpen）
```

## 生成预览配置文件
如果你想生成该文件，可以按下 <kbd>CMD+Shift+P</kbd>，打开命令面板，输入 `preview`，在命令列表中点击 **Preview: Generate Preview Config File**。

## 启动预览窗口
有了这个文件后，你可以自己启动预览窗口。按下 <kbd>CMD+Shift+P</kbd>，打开命令面板，输入 `preview`，在命令列表中点击 **Preview: Open Preview Tab**。

## 部署到云厂商
`deploy.yml` 是 DeployKit 的自定义部署配置文件。无需 `deploy.yml` 文件，马上 打开 DeployKit 插件体验把项目一键部署到云厂商吧。

