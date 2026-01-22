(function () {
  const pluginId = "bf-rule-list-plugin";
  const plugin = BF2042Portal.Plugins.getPlugin(pluginId);

  /* -----------------------------------------------------
     Utility: get all rule blocks in the current MOD
     (top-level rule blocks only)
  ----------------------------------------------------- */
  function getRuleBlocks(ws) {
    return ws.getTopBlocks(false).filter(b => b.type === "ruleBlock");
  }

  /* -----------------------------------------------------
     Pan workspace to a block
  ----------------------------------------------------- */
  function focusBlock(ws, block) {
    const metrics = ws.getMetrics();
    const scale = ws.scale || 1;

    const x = block.getRelativeToSurfaceXY().x;
    const y = block.getRelativeToSurfaceXY().y;

    const targetX = x * scale - metrics.viewWidth / 2;
    const targetY = y * scale - metrics.viewHeight / 2;

    if (ws.scrollbar) {
      ws.scrollbar.set(targetX, targetY);
    }
  }

  /* -----------------------------------------------------
     UI: Rule List Modal
  ----------------------------------------------------- */
  function openRuleListUI(ws) {
    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 10000;
    `;

    // Panel
    const panel = document.createElement("div");
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-height: 70vh;
      background: #1e1e1e;
      color: #fff;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
    `;

    // Header
    const header = document.createElement("div");
    header.textContent = "Rule List";
    header.style.cssText = `
      padding: 10px 14px;
      font-weight: bold;
      border-bottom: 1px solid #333;
    `;

    // List
    const list = document.createElement("div");
    list.style.cssText = `
      padding: 8px;
      overflow-y: auto;
      flex: 1;
    `;

    const rules = getRuleBlocks(ws);

    if (rules.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No rules found in this MOD.";
      empty.style.opacity = "0.7";
      list.appendChild(empty);
    } else {
      rules.forEach((rule, index) => {
        const item = document.createElement("div");
        item.style.cssText = `
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
        `;
        item.textContent = `${index + 1}. ${rule.getFieldValue("NAME") || "Unnamed Rule"}`;

        item.addEventListener("mouseenter", () => {
          item.style.background = "#2a2a2a";
        });
        item.addEventListener("mouseleave", () => {
          item.style.background = "transparent";
        });
        item.addEventListener("click", () => {
          focusBlock(ws, rule);
          document.body.removeChild(backdrop);
        });

        list.appendChild(item);
      });
    }

    // Footer
    const footer = document.createElement("div");
    footer.style.cssText = `
      padding: 10px;
      border-top: 1px solid #333;
      display: flex;
      justify-content: flex-end;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = `
      padding: 6px 14px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => document.body.removeChild(backdrop);

    footer.appendChild(closeBtn);

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    // Click outside closes
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
      }
    });
  }

  /* -----------------------------------------------------
     Context Menu Item
  ----------------------------------------------------- */
  const ruleListMenuItem = {
    id: "bfRuleList",
    displayText: "Rule List",
    preconditionFn: () => "enabled",
    callback: () => {
      const ws = _Blockly.getMainWorkspace();
      if (ws) openRuleListUI(ws);
    },
    scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    weight: 95
  };

  /* -----------------------------------------------------
     Init
  ----------------------------------------------------- */
  plugin.initializeWorkspace = function () {
    try {
      const registry = _Blockly.ContextMenuRegistry.registry;
      if (registry.getItem(ruleListMenuItem.id)) {
        registry.unregister(ruleListMenuItem.id);
      }
      registry.register(ruleListMenuItem);

      console.info("[RuleListPlugin] Initialized");
    } catch (e) {
      console.error("[RuleListPlugin] Init failed:", e);
    }
  };
})();
