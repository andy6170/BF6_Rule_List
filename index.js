(function () {
  const pluginId = "bf-rules-navigator-plugin";
  const plugin = BF2042Portal.Plugins.getPlugin(pluginId);

  let panelEl = null;
  let buttonEl = null;

  function getWorkspace() {
    return _Blockly.getMainWorkspace
      ? _Blockly.getMainWorkspace()
      : Blockly.getMainWorkspace();
  }

  /* --------------------------------------------------
     Get top-level RULE blocks inside the MOD
  -------------------------------------------------- */
  function getRuleBlocks(ws) {
    return ws.getTopBlocks(false).filter(b => {
      // BF Portal rule blocks are top-level and have no output/previous
      return !b.outputConnection && !b.previousConnection;
    });
  }

  /* --------------------------------------------------
     Center workspace on a block
  -------------------------------------------------- */
  function focusBlock(ws, block) {
    const xy = block.getRelativeToSurfaceXY();
    const metrics = ws.getMetrics();

    const x = xy.x - metrics.viewWidth / 2;
    const y = xy.y - metrics.viewHeight / 2;

    ws.scroll(x, y);
    block.select();
  }

  /* --------------------------------------------------
     Create floating panel
  -------------------------------------------------- */
  function createPanel(ws) {
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
      return;
    }

    panelEl = document.createElement("div");
    panelEl.style.position = "absolute";
    panelEl.style.top = "40px";
    panelEl.style.right = "0";
    panelEl.style.width = "260px";
    panelEl.style.maxHeight = "70vh";
    panelEl.style.background = "#1e1e1e";
    panelEl.style.border = "1px solid #444";
    panelEl.style.color = "#fff";
    panelEl.style.overflowY = "auto";
    panelEl.style.zIndex = "10";
    panelEl.style.padding = "8px";
    panelEl.style.fontSize = "12px";

    panelEl.innerHTML = `<b>Rules in MOD</b><hr/>`;

    const rules = getRuleBlocks(ws);

    rules.forEach((block, index) => {
      const item = document.createElement("div");
      item.style.padding = "6px";
      item.style.cursor = "pointer";
      item.style.borderBottom = "1px solid #333";
      item.textContent = `Rule ${index + 1}`;

      item.addEventListener("click", () => {
        focusBlock(ws, block);
      });

      item.addEventListener("mouseenter", () => {
        item.style.background = "#333";
      });
      item.addEventListener("mouseleave", () => {
        item.style.background = "transparent";
      });

      panelEl.appendChild(item);
    });

    toolboxDiv.parentElement.appendChild(panelEl);
  }

  /* --------------------------------------------------
     Add toggle button next to toolbox
  -------------------------------------------------- */
  function createButton(ws) {
    if (buttonEl) return;

    const toolboxDiv = document.querySelector(".blocklyToolboxDiv");
    if (!toolboxDiv) return;

    const parent = toolboxDiv.parentElement;
    parent.style.position = "relative";

    buttonEl = document.createElement("button");
    buttonEl.textContent = "Rules";
    buttonEl.style.position = "absolute";
    buttonEl.style.top = "8px";
    buttonEl.style.right = "-52px";
    buttonEl.style.width = "48px";
    buttonEl.style.height = "24px";
    buttonEl.style.fontSize = "11px";
    buttonEl.style.cursor = "pointer";

    /* Behind toolbox */
    buttonEl.style.zIndex = "1";
    toolboxDiv.style.zIndex = "2";

    buttonEl.addEventListener("click", () => {
      createPanel(ws);
    });

    parent.appendChild(buttonEl);
  }

  /* --------------------------------------------------
     Init
  -------------------------------------------------- */
  plugin.initializeWorkspace = function () {
    try {
      const ws = getWorkspace();
      if (!ws) return;

      createButton(ws);
      console.info("[RulesNavigator] Initialized");
    } catch (e) {
      console.error("[RulesNavigator] Init failed:", e);
    }
  };
})();
