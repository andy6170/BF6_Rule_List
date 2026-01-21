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

  function createToggleButton(toolboxDiv) {
    if (document.getElementById("bfRuleToggle")) return;

    const btn = document.createElement("button");
    btn.id = "bfRuleToggle";
    btn.textContent = "Rules";
    btn.style.cssText = `
      position: absolute;
      right: -32px;
      top: 10px;
      width: 28px;
      height: 80px;
      writing-mode: vertical-rl;
      background: #2b2b2b;
      color: #fff;
      border: 1px solid #444;
      cursor: pointer;
      z-index: 999;
    `;

    toolboxDiv.parentElement.appendChild(btn);
    return btn;
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
      width: 400px;
      max-height: 70vh;
      background: #1e1e1e;
      color: #fff;
      border: 1px solid #444;
      padding: 10px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    document.body.appendChild(panel);
    return panel;
  }

  function listRules(ws, panel) {
    panel.innerHTML = "<h3>Rules</h3>";
    const blocks = ws.getTopBlocks(true);

    let index = 1;
    blocks.forEach(block => {
      if (block.type !== "ruleBlock") return;

      const item = document.createElement("div");
      item.textContent = `${index}. ${block.getFieldValue("NAME") || "Unnamed Rule"}`;
      item.style.cursor = "pointer";
      item.style.padding = "4px";

      item.onclick = () => {
        ws.centerOnBlock(block.id);
        panel.style.display = "none";
      };

      panel.appendChild(item);
      index++;
    });
  }

  plugin.initializeWorkspace = function () {
    waitForBlocklyReady((ws) => {
      const toolboxDiv = document.querySelector(".blocklyToolboxDiv");
      if (!toolboxDiv) return;

      const btn = createToggleButton(toolboxDiv);
      const panel = createPanel();

      btn.onclick = () => {
        listRules(ws, panel);
        panel.style.display =
          panel.style.display === "none" ? "block" : "none";
      };

      console.info("[Rule Navigator] Initialized safely");
    });
  };
})();
