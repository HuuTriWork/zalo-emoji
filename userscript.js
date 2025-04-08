// ==UserScript==
// @name         Zalo Custom Reactions
// @namespace    https://e-z.bio/anhwaivo
// @version      2.0
// @description  Menu + icon
// @author       anhwaivo & waifucat
// @match        https://*.zalo.me/*
// @match        https://chat.zalo.me/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const emojiChars = "😀😃😄😁😆😅😂🤣☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚🤗🤩🥳😎🧐🤓😕😟🙁☹️😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😠😡🤬😈👿💀☠️👻👽🤖💩🙈🙉🙊👶🧒👦👧🧑👨👩🧓👴👵👨‍⚕️👩‍⚕️👨‍🎓👩‍🎓👨‍🏫👩‍🏫👨‍🏭👩‍🏭👨‍💻👩‍💻👨‍💼👩‍💼👨‍🔧👩‍🔧👨‍🔬👩‍🔬👨‍🎤👩‍🎤👨‍🚒👩‍🚒👮‍♂️👮‍♀️🕵️‍♂️🕵️‍♀️💂‍♂️💂‍♀️👷‍♂️👷‍♀️🤴👸👳‍♂️👳‍♀️🧕👲🤵👰🤰🤱🍼❤️🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟💋💌💤💢💥💦💨🕳️💣💬👁️‍🗨️🗨️🗯️💭🍎🍊🍇🍉🍌🍍🥭🍑🍒🍓🥝🍅🥑🥦🥬🥒🌶️🧄🧅🍠🥔🥕🌽🍞🥐🥖🥨🧀🥚🍳🥞🧇🥓🥩🍗🍖🌭🍔🍟🍕🥪🥙🌮🌯🥗🍝🍜🍲🍛🍣🍱🥟🍤🍚🍘🍥🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🥠🥡🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🧃🧉🧊🍽️🍴🥄🔪"; 
const reactions = Array.from(emojiChars).map((icon, idx) => ({
  type: 200 + idx,
  icon,
  name: `emoji${idx}`,
}));

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === "childList" && m.addedNodes.length > 0) {
        const lists = Array.from(m.addedNodes).flatMap(n =>
          n.querySelectorAll?.(".reaction-emoji-list") || []
        );
        if (lists.length > 0) setTimeout(addCustomReactions, 100);
      }
    }
  });

  function addCustomReactions() {
    document.querySelectorAll(".reaction-emoji-list").forEach(list => {
      if (list.getAttribute("data-extended") === "true") return;
      list.setAttribute("data-extended", "true");

      const wrapper = list.closest(".emoji-list-wrapper");
      if (!wrapper) return;

      const btn = wrapper.querySelector('[id^="reaction-btn-"]');
      const id = btn?.id.replace("reaction-btn-", "");

      reactions.forEach((react, idx) => {
        const div = document.createElement("div");
        div.className = "reaction-emoji-icon";
        div.setAttribute("data-custom", "true");
        div.style.animationDelay = `${idx * 40}ms`;
        div.innerText = react.icon;

        div.addEventListener("click", e => {
          e.stopPropagation();
          const getReactFiber = el =>
            Object.values(el).find(k => k?.return && k.memoizedProps);

          let fiber = getReactFiber(wrapper);
          while (fiber) {
            if (fiber.memoizedProps?.sendReaction) {
              fiber.memoizedProps.sendReaction({
                rType: react.type,
                rIcon: react.icon,
              });
              id && updateBtn(id, react);
              break;
            }
            fiber = fiber.return;
          }

          wrapper.classList.add("hide-elist");
          wrapper.classList.remove("show-elist");
        });

        list.appendChild(div);
      });

      wrapper.style.position = "absolute";
      wrapper.style.right = "-240px";
      wrapper.style.top = "0";
      wrapper.style.background = "#fff";
      wrapper.style.padding = "12px";
      wrapper.style.borderRadius = "14px";
      wrapper.style.boxShadow = "0 0 10px rgba(0,0,0,0.25)";
      wrapper.style.zIndex = "9999";
      wrapper.style.maxHeight = "300px";
      wrapper.style.overflowY = "auto";
    });
  }

  function updateBtn(id, react) {
    const span = document.querySelector(`#reaction-btn-${id} span`);
    if (span) {
      span.innerText = react.icon;
    }
  }

  function initReactions() {
    if (window.S?.default) {
      if (
        !window.S.default.reactionMsgInfo.some(r => r.rType >= 100)
      ) {
        window.S.default.reactionMsgInfo.push(
          ...reactions.map(r => ({
            rType: r.type,
            rIcon: r.icon,
            name: r.name,
          }))
        );
      }
    } else setTimeout(initReactions, 1000);
  }

  const style = document.createElement("style");
  style.textContent = `
    .reaction-emoji-list {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 8px;
      max-width: 250px;
      justify-content: center;
      padding: 5px;
    }
    .reaction-emoji-icon {
      font-size: 22px;
      cursor: pointer;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s;
      padding: 6px;
      border-radius: 10px;
    }
    .reaction-emoji-icon:hover {
      transform: scale(1.3);
      background: #f0f0f0;
      box-shadow: 0 0 5px rgba(0,0,0,0.15);
    }
  `;
  document.head.appendChild(style);

  observer.observe(document.body, { childList: true, subtree: true });
  initReactions();
})();
