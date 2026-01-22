(function () {
  const pluginId = "bf-rule-navigator";
  const plugin = BF2042Portal.Plugins.getPlugin(pluginId);

  function waitForBlocklyReady(cb) {
    const interval = setInterval(() => {
      try {
        if (window._Blockly && _Blockly.getMainWorkspace?.()) {
          clearInterval(interval);
          cb(_Blockly.getMainWorkspace());
        }
      } catch (_) {}
    }, 100);
  }

  function createPanel() {
    let panel = document.getElementById("bfRulePanel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "bfRulePanel";
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-height: 70vh;
      background: #1e1e1e;
      color: #fff;
      border: 1px solid #444;
      padding: 10px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
    `;

    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.cssText = `
      position: sticky;
      bottom: 0;
      margin-top: 10px;
      padding: 6px 12px;
      background: #333;
      color: #fff;
      border: 1px solid #555;
      cursor: pointer;
      float: right;
    `;
    close.onclick = () => (panel.style.display = "none");

    panel.appendChild(close);
    document.body.appendChild(panel);
    return panel;
  }

  function scrollToBlock(ws, block) {
    const xy = block.getRelativeToSurfaceXY();
    const scale = ws.scale || 1;

    ws.scrollbar.set(
      xy.x * scale - ws.getMetrics().viewWidth / 2,
      xy.y * scale - ws.getMetrics().viewHeight / 2
    );
  }

  function listRules(ws, panel) {
    panel.innerHTML = "<h3>Rules</h3>";

    const rules = ws
      .getTopBlocks(true)
      .filter(b => b.type === "ruleBlock" && !b.isShadow());

    let index = 1;

    rules.forEach(block => {
      const name =
        block.getFieldValue("NAME") ||
        block.getField("NAME")?.getText() ||
        "Unnamed Rule";

      const item = document.createElement("div");
      item.textContent = `${index}. ${name}`;
      item.style.cssText = `
        padding: 6px;
        margin: 2px 0;
        cursor: pointer;
        border-radius: 4px;
      `;

      item.onmouseenter = () =>
        (item.style.background = "rgba(180,140,255,0.25)");
      item.onmouseleave = () =>
        (item.style.background = "transparent");

      item.onclick = () => {
        scrollToBlock(ws, block);
        panel.style.display = "none";
      };

      panel.appendChild(item);
      index++;
    });
  }

  plugin.initializeWorkspace = function () {
    waitForBlocklyReady(ws => {
      const reg = _Blockly.ContextMenuRegistry.registry;

      if (!reg.getItem("bfRuleList")) {
        reg.register({
          id: "bfRuleList",
          displayText: "Rule List",
          preconditionFn: () => "enabled",
          callback: () => {
            const panel = createPanel();
            listRules(ws, panel);
            panel.style.display = "block";
          },
          scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
          weight: 90
        });
      }

      console.info("[Rule Navigator] Initialized");
    });
  };
})();
