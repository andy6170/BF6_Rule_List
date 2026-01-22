(function () {
  const pluginId = "bf-rule-list";
  const plugin = BF2042Portal.Plugins.getPlugin(pluginId);

  /* -----------------------------------------------------
     Helpers
  ----------------------------------------------------- */
  function waitForWorkspace(cb) {
    const i = setInterval(() => {
      try {
        if (window._Blockly && _Blockly.getMainWorkspace?.()) {
          clearInterval(i);
          cb(_Blockly.getMainWorkspace());
        }
      } catch (_) {}
    }, 100);
  }

  /* -----------------------------------------------------
     UI: Rule List Panel
  ----------------------------------------------------- */
  function createPanel() {
    let panel = document.getElementById("bfRuleListPanel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "bfRuleListPanel";
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
      display: none;
      z-index: 10000;
      box-shadow: 0 0 20px rgba(0,0,0,0.6);
      font-family: sans-serif;
    `;

    const header = document.createElement("div");
    header.textContent = "Rule List";
    header.style.cssText = `
      padding: 10px;
      font-weight: bold;
      border-bottom: 1px solid #333;
    `;

    const list = document.createElement("div");
    list.id = "bfRuleList";
    list.style.cssText = `
      padding: 8px;
      overflow-y: auto;
      max-height: calc(70vh - 90px);
    `;

    const footer = document.createElement("div");
    footer.style.cssText = `
      padding: 10px;
      border-top: 1px solid #333;
      text-align: right;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = `
      padding: 6px 12px;
      background: #444;
      color: #fff;
      border: 1px solid #666;
      cursor: pointer;
    `;
    closeBtn.onclick = () => (panel.style.display = "none");

    footer.appendChild(closeBtn);
    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    return panel;
  }

  /* -----------------------------------------------------
     Populate Rule List (MOD ONLY)
  ----------------------------------------------------- */
 function populateRules(ws, panel) {
  const list = panel.querySelector("#bfRuleList");
  list.innerHTML = "";

  const allBlocks = ws.getAllBlocks(false);
  let index = 1;

  allBlocks.forEach(block => {
    if (block.type !== "ruleBlock") return;

    const parent = block.getSurroundParent?.();
    if (!parent) return;

    // ✅ ONLY rules inside the MOD container
    if (parent.type !== "modBlock") return;

    const ruleName =
      block.getFieldValue?.("NAME") ||
      block.getFieldValue?.("RULE_NAME") ||
      "Unnamed Rule";

    const item = document.createElement("div");
    item.textContent = `${index}. ${ruleName}`;
    item.style.cssText = `
      padding: 6px;
      cursor: pointer;
      border-radius: 4px;
    `;

    item.onmouseenter = () => {
      item.style.background = "#6f63b6";
    };
    item.onmouseleave = () => {
      item.style.background = "transparent";
    };

    item.onclick = () => {
  panel.style.display = "none";

  // Get absolute workspace position (accounts for MOD parent)
  const pos = block.getRelativeToSurfaceXY();

  const metrics = ws.getMetrics();
  const scale = ws.scale;

  // Calculate scroll so block is centered in view
  const targetX =
    pos.x * scale - metrics.viewWidth / 2 + block.width * scale / 2;
  const targetY =
    pos.y * scale - metrics.viewHeight / 2 + block.height * scale / 2;

  ws.scroll(targetX, targetY);
  ws.setSelected(block);
};


    list.appendChild(item);
    index++;
  });

  if (index === 1) {
    list.innerHTML = `
      <div style="opacity:0.7;padding:6px;">
        No rules found inside this MOD
      </div>
    `;
  }
}


  /* -----------------------------------------------------
     Context Menu Registration
  ----------------------------------------------------- */
  const ruleListMenuItem = {
    id: "bfRuleListMenu",
    displayText: "Rule List",
    preconditionFn: () => "enabled",
    callback: () => {
      const ws = _Blockly.getMainWorkspace();
      const panel = createPanel();
      populateRules(ws, panel);
      panel.style.display = "block";
    },
    scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    weight: 95
  };

  /* -----------------------------------------------------
     Init
  ----------------------------------------------------- */
  plugin.initializeWorkspace = function () {
    waitForWorkspace(() => {
      const registry = _Blockly.ContextMenuRegistry.registry;

      if (registry.getItem(ruleListMenuItem.id)) {
        registry.unregister(ruleListMenuItem.id);
      }
      registry.register(ruleListMenuItem);

      console.info("[Rule List] Initialized");
    });
  };
})();
