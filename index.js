(function () {
  const pluginId = "bf-rule-list-plugin";

  function getWorkspace() {
    return _Blockly?.getMainWorkspace?.() || _Blockly?.getMainWorkspace?.();
  }

  /* ---------------------------
     Find MOD + Rules
  ---------------------------- */
  function getRulesFromMod(ws) {
    const topBlocks = ws.getTopBlocks(false);

    // Find the MOD block (adjust type if needed)
    const modBlock = topBlocks.find(b => b.type === "modBlock" || b.type === "MOD");

    if (!modBlock) return [];

    const rules = [];
    const input = modBlock.getInput("RULES") || modBlock.getInput("ACTIONS");

    if (!input || !input.connection) return [];

    let block = input.connection.targetBlock();
    let index = 1;

    while (block) {
      rules.push({
        index,
        block,
        name: block.getFieldValue("RULE_NAME") || `Rule ${index}`
      });
      index++;
      block = block.getNextBlock();
    }

    return rules;
  }

  /* ---------------------------
     Center Workspace on Block
  ---------------------------- */
  function focusBlock(ws, block) {
    const xy = block.getRelativeToSurfaceXY();
    const scale = ws.scale;
    const metrics = ws.getMetrics();

    const x = (xy.x * scale) - (metrics.viewWidth / 2);
    const y = (xy.y * scale) - (metrics.viewHeight / 2);

    ws.scrollbar.set(x, y);
    block.select();
  }

  /* ---------------------------
     UI Window
  ---------------------------- */
  function openRuleList() {
    const ws = getWorkspace();
    if (!ws) return;

    const rules = getRulesFromMod(ws);

    // Overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 9999;
    `;

    // Panel
    const panel = document.createElement("div");
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 320px;
      max-height: 70vh;
      background: #1e1e1e;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      color: #fff;
      font-family: sans-serif;
    `;

    const list = document.createElement("div");
    list.style.cssText = `
      flex: 1;
      overflow-y: auto;
      margin-bottom: 10px;
    `;

    let selected = null;

    rules.forEach(r => {
      const item = document.createElement("div");
      item.textContent = `${r.index}. ${r.name}`;
      item.style.cssText = `
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
      `;

      item.onclick = () => {
        if (selected) selected.style.background = "";
        item.style.background = "#8b6cff55"; // light purple
        selected = item;
        focusBlock(ws, r.block);
      };

      list.appendChild(item);
    });

    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.cssText = `
      align-self: flex-end;
      padding: 6px 12px;
      cursor: pointer;
    `;
    close.onclick = () => overlay.remove();

    panel.appendChild(list);
    panel.appendChild(close);
    overlay.appendChild(panel);

    overlay.onclick = e => {
      if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
  }

  /* ---------------------------
     Context Menu
  ---------------------------- */
  _Blockly.ContextMenuRegistry.registry.register({
    id: "bf-rule-list",
    displayText: "Rule List",
    preconditionFn: () => "enabled",
    callback: openRuleList,
    scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    weight: 95
  });

  console.info("[RuleListPlugin] Loaded");
})();
