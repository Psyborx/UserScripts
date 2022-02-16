// ==UserScript==
// @name         Gmail Tabs
// @namespace    http://psyborx.com/
// @version      1.1
// @description  Add custom tabs to Gmail
// @author       Psyborx
// @match        *://mail.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @updateURL    https://raw.githubusercontent.com/Psyborx/UserScripts/main/GmailTabs.user.js
// @downloadURL  https://raw.githubusercontent.com/Psyborx/UserScripts/main/GmailTabs.user.js
// ==/UserScript==

(function() {

  const stylesheet = `
    #customTabsContainer {
      display: inline-block;
      width: 100%;
    }
    .customTabs {
      width: 100%;
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      border-bottom: 1px solid rgba(75,80,83);
      margin-bottom: 10px;
    }
    .customTabsC {
      height: 36px !important;
      overflow: hidden;
    }
    .customTabsU {
      height: auto !important;
    }
    .customTabsNo {
      display: none !important;
    }
    .customTab {
      padding: 10px;
      min-height: 16px;
    }
    .ctSelected {
      padding-bottom: 7px;
      border-bottom: 3px solid rgba(255,255,255,0.70);
    }
    .customTab:hover {
      background-color: rgba(84,89,91);
    }
    .customTab > a {
      display: block;
      width: 100%;
      height: 100%;
      color: rgba(255,255,255,0.70);
      text-decoration: none;
    }
    .collapseBtn {
      z-index: 99;
      margin-right: 10px;
    }
    .collapseBtnBg {
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
    }
    .collapseBtnBgC {
      background-image: url('https://www.gstatic.com/images/icons/material/system_gm/1x/keyboard_arrow_down_white_20dp.png');
    }
    .collapseBtnBgU {
      background-image: url('https://www.gstatic.com/images/icons/material/system_gm/1x/keyboard_arrow_up_white_20dp.png');
    }
    `;
  document.head.insertAdjacentHTML('beforeend', `<style>${stylesheet}</style>`);

  const gmtt = {
    intWait: 250,
    maxWait: 15000,
    totalWait: 0,
    baseUrl: null,
    customTabBar: null,
    selected: null,
    collapsed: true,
    tabsConfig: [{ //Tabs configuration object
      id: 'impunread',
      query: 'in:inbox is:(important unread)',
      label: 'Important & Unread'
    }, {
      id: 'pinned',
      query: 'label/Pinned',
      label: 'Pinned'
    }, {
      id: 'unpinned',
      query: 'in:inbox -label:pinned',
      label: 'Unpinned'
    }, {
      id: 'clean',
      query: 'in:inbox {label:pinned (-category:{promotions social forums} -label:{apartment shopping shipping finances recruitment patreon})}',
      label: 'Clean'
    }, {
      id: 'starred',
      query: 'starred',
      label: 'Starred'
    }, {
      id: 'security',
      query: 'in:inbox label:security',
      label: 'Security'
    }, {
      id: 'alerts',
      query: 'in:inbox label:alerts',
      label: 'Alerts'
    }, {
      id: 'apartment',
      query: 'in:inbox label:apartment',
      label: 'Apartment'
    }, {
      id: 'finances',
      query: 'in:inbox label:finances',
      label: 'Finances'
    }, {
      id: 'shopping',
      query: 'in:inbox label:shopping',
      label: 'Shopping'
    }, {
      id: 'shipping',
      query: 'in:inbox label:shipping',
      label: 'Shipping'
    }, {
      id: 'social',
      query: 'in:inbox category:social',
      label: 'Social'
    }, {
      id: 'recruitment',
      query: 'in:inbox label:recruitment',
      label: 'Recruitment'
    }, {
      id: 'patreon',
      query: 'in:inbox label:patreon',
      label: 'Patreon'
    }, {
      id: 'network',
      query: 'in:inbox label:network-alerts',
      label: 'Network'
    }, {
      id: 'forums',
      query: 'in:inbox category:forums',
      label: 'Forums'
    }, {
      id: 'promotions',
      query: 'in:inbox category:promotions',
      label: 'Promotions'
    }, {
      id: 'attachment',
      query: 'attach_or_drive=true',
      label: 'Attachment'
    }, {
      id: 'documents',
      query: '{from:docusign.net "docs.google.com" has:document has:pdf filename:{doc docx odt fodt pages pages-tef xls xlsx ods fods numbers numbers-tef ppt pptx pps ppsx odp fodp key keynote key-tef pdf ps}}',
      label: 'Documents'
    }, {
      id: 'pictures',
      query: '{has:image filename:{bmp png jpg jpeg jp2 gif webp apng avif tiff emf wmf ai svg xcf psd heic raw dng arw}}',
      label: 'Pictures'
    }, {
      id: 'videos',
      query: '{has:video filename:{avi mov qt mpg mpeg mp4 m4p m4v mkv webm flv vob ogv ogg wmv rm rmvb asf 3gp mts m2ts ts}}',
      label: 'Videos'
    }],
    shouldDisplay: (hash, numSegments) => {
      return hash.length == numSegments || (hash.length == numSegments + 1 && /p\d+/.test(hash[hash.length - 1]));
    },
    init: () => {
      gmtt.totalWait += gmtt.intWait;
      gmtt.baseUrl = document.location.origin + document.location.pathname;
      let display = true;
      let query = document.location.hash.replace('#', '');
      const hash = query.split('/');

      switch (hash[0]) {
        case 'settings':
          display = false;
          break;
        case 'inbox':
        case 'starred':
        case 'snoozed':
        case 'sent':
        case 'scheduled':
        case 'all':
        case 'spam':
        case 'trash':
          display = gmtt.shouldDisplay(hash, 1);
          break;
        case 'label':
        case 'category':
        case 'chats':
          display = gmtt.shouldDisplay(hash, 2);
          query = hash.slice(0, 2).join('/');
          break;
        case 'search':
        case 'advanced-search':
          display = gmtt.shouldDisplay(hash, 2);
          query = decodeURIComponent(hash[1]).replace(/(&isrefinement=true)$/, '').replace(/[\u002B]/g, ' ');
          break;
      }

      if (display) {
        const tabCfg = gmtt.tabsConfig.find(tCfg => tCfg.query == query);
        if (tabCfg) {
          gmtt.selected = tabCfg.id;
        } else {
          gmtt.selected = null;
        }
      }

      const tabParent = document.querySelector('.AO');
      if (tabParent && document.querySelector('.vX.UC').offsetParent === null) {
        //console.log("*************** Tab Parent found");
        gmtt.totalWait = 0;
        if (!display) {
          if (gmtt.customTabBar && !gmtt.customTabBar.classList.contains('customTabsNo')) {
            gmtt.customTabBar.classList.add('customTabsNo');
          }
        } else {
          if (gmtt.customTabBar) {
            if (gmtt.customTabBar.classList.contains('customTabsNo')) {
              gmtt.customTabBar.classList.remove('customTabsNo');
            }
            gmtt.customTabBar.querySelectorAll('.customTab').forEach(customTab => {
              if (gmtt.selected && customTab.id == `ct-${gmtt.selected}`) {
                if (!customTab.classList.contains('ctSelected')) {
                  customTab.classList.add('ctSelected');
                }
              } else {
                if (customTab.classList.contains('ctSelected')) {
                  customTab.classList.remove('ctSelected');
                }
              }
            });
          } else {
            gmtt.customTabBar = document.createElement('div');
            gmtt.customTabBar.id = 'customTabBar';
            gmtt.customTabBar.className = 'aKh aKx customTabs customTabsC';
            const fragment = document.createDocumentFragment();
            gmtt.tabsConfig.forEach(tabCfg => {
              const tab = document.createElement('div');
              tab.id = `ct-${tabCfg.id}`;
              tab.className = `aKz customTab ${tabCfg.id == gmtt.selected ? ' ctSelected' : ''}`;
              let url = gmtt.baseUrl;
              if (/^[\w/]+$/.test(tabCfg.query)) {
                url += `#${tabCfg.query}`;
              } else if (/(&|=)/.test(tabCfg.query)) {
                url += `#advanced-search/${encodeURIComponent(tabCfg.query)}&isrefinement=true`
              } else {
                url += `#search/${encodeURIComponent(tabCfg.query)}`
              }
              const anchor = document.createElement('a');
              anchor.id = `ct-a-${tabCfg.id}`
              anchor.href = url;
              anchor.setAttribute('target', '_top');
              anchor.setAttribute('aria-label', tabCfg.label);
              anchor.setAttribute('tabindex', -1);
              anchor.setAttribute('draggable', false);
              anchor.innerText = tabCfg.label;
              tab.appendChild(anchor);
              fragment.appendChild(tab);
            });
            gmtt.customTabBar.appendChild(fragment);

            window.addEventListener('hashchange', gmtt.init);
          }
          if (!tabParent.querySelector('.customTabs')) {
            const container = document.createElement('div');
            container.id = 'customTabsContainer'
            container.appendChild(gmtt.customTabBar);

            const collapseBtn = document.createElement('div');
            collapseBtn.className = 'Ij Yn collapseBtn';
            const collapseBtnBg = document.createElement('span');
            collapseBtnBg.className = 'Ik collapseBtnBg collapseBtnBgC';
            collapseBtn.addEventListener('click', () => {
              if(gmtt.collapsed) {
                collapseBtnBg.classList.remove('collapseBtnBgC');
                collapseBtnBg.classList.add('collapseBtnBgU');
                gmtt.customTabBar.classList.remove('customTabsC');
                gmtt.customTabBar.classList.add('customTabsU');
              } else {
                collapseBtnBg.classList.remove('collapseBtnBgU');
                collapseBtnBg.classList.add('collapseBtnBgC');
                gmtt.customTabBar.classList.remove('customTabsU');
                gmtt.customTabBar.classList.add('customTabsC');
              }
              gmtt.collapsed = !gmtt.collapsed;
            });
            collapseBtn.appendChild(collapseBtnBg);
            container.appendChild(collapseBtn);

            tabParent.prepend(container);
          }
        }
      } else if (gmtt.totalWait < gmtt.maxWait) {
        //console.warn("*************** Tab Parent not found yet");
        window.setTimeout(gmtt.init, gmtt.intWait);
      } else {
        console.error("*************** Tab Parent was never found and the future refused to change :-(");
      }
      return this;
    }
  };
  gmtt.init();
})();