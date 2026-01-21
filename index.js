(function () {
  const pluginId = "bf-rule-navigator";
  const plugin = BF2042Portal.Plugins.getPlugin(pluginId);

  let panel = null;
  let toggleBtn = null;

  function getWorkspace() {
    return _Blockly.getMainWorkspace();
  }

  /* -----------------------------------------------------
     RULE DISCOVERY
  ----------------------------------------------------- */
  function getRules(ws) {
    return ws.getTopBlocks(true);
  }

  function getRuleLabel(block, index) {
    // Try to extract a visible name, fallback to type
    let name = block.getFieldValue?.("RULE_NAME")
      || block.getFieldValue?.("NAME")
      || block.type;

    return `${index + 1}. ${name}`;
  }

  /* -----------------------------------------------------
     NAVIGATION
  ----------------------------------------------------- */
  function focusRule(block) {
    const ws = getWorkspace();
    if (!ws) return;
    ws.centerOnBlock(block.id);
    block.select();
  }

  /* -----------------------------------------------------
     UI CREATION
  ----------------------------------------------------- */
  function createUI() {
    const toolbox = document.querySelector(".blocklyToolboxDiv");
    if (!toolbox) return;

    // Toggle button
    toggleBtn = document.createElement("div");
    toggleBtn.textContent = "Rules ▸";
    toggleBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: -48px;
      width: 44px;
      height: 28px;
      background: #2c2c2c;
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      user-select: none;
      z-index: 1000;
    `;

    toolbox.style.position = "relative";
    toolbox.appendChild(toggleBtn);

    // Panel
    panel = document.createElement("div");
    panel.style.cssText = `
      position: absolute;
      top: 0;
      left: 100%;
      width: 260px;
      height: 100%;
      background: #1f1f1f;
      color: #fff;
      overflow-y: auto;
      padding: 8px;
      display: none;
      z-index: 999;
      box-shadow: 2px 0 6px rgba(0,0,0,0.4);
    `;
    toolbox.appendChild(panel);

    toggleBtn.onclick = () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      if (panel.style.display === "block") {
        rebuildList();
      }
    };
  }

  /* -----------------------------------------------------
     PANEL CONTENT
  ----------------------------------------------------- */
  function rebuildList() {
    panel.innerHTML = "<b>Rules</b><hr style='opacity:.3'>";

    const ws = getWorkspace();
    if (!ws) return;

    const rules = getRules(ws);

    rules.forEach((block, i) => {
      const item = document.createElement("div");
      item.textContent = getRuleLabel(block, i);
      item.style.cssText = `
        padding: 6px 8px;
        margin-bottom: 4px;
        background: #2a2a2a;
        border-radius: 4px;
        cursor: pointer;
      `;

      item.onmouseenter = () => item.style.background = "#3a3a3a";
      item.onmouseleave = () => item.style.background = "#2a2a2a";

      item.onclick = () => focusRule(block);

      panel.appendChild(item);
    });
  }

  /* -----------------------------------------------------
     INIT
  ----------------------------------------------------- */
  plugin.initializeWorkspace = function () {
    try {
      createUI();
      console.info("[RuleNavigator] Initialized");
    } catch (e) {
      console.error("[RuleNavigator] Init failed:", e);
    }
  };
})();
