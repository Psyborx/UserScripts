// ==UserScript==
// @name         Gmail Tabs
// @namespace    http://psyborx.com/
// @version      1.12
// @description  Add custom tabs to Gmail
// @author       Psyborx
// @match        *://mail.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @updateURL    https://raw.githubusercontent.com/Psyborx/UserScripts/main/GmailTabs.user.js
// @downloadURL  https://raw.githubusercontent.com/Psyborx/UserScripts/main/GmailTabs.user.js
// ==/UserScript==

(function() {
  const matIconsUrl = 'https://www.gstatic.com/images/icons/material/system_gm/1x/';
  const isrefinementParam = '&isrefinement=true';
  const stylesheet = `
    .customTabsContainer {
      display: inline-block;
      width: calc(100% - 40px);
      position: relative;
      padding-right: 44px;
      border-bottom: 1px solid rgba(182,182,182);
    }
    .displayNone {
      display: none !important;
    }
    .customTabs {
      width: 100%;
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      margin-bottom: 10px;
    }
    .customTabsC {
      height: 36px !important;
      overflow: hidden;
    }
    .customTabsE {
      height: auto !important;
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
      display: grid;
      grid-template-columns: 20px 1fr;
      grid-gap: 10px;
      width: 100%;
      height: 100%;
      color: rgba(255,255,255,0.70);
      text-decoration: none;
    }
    .customTabIcon {
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
    }
    .collapseBtn {
      z-index: 5;
      margin-right: 1px;
      margin-top: 5px;
    }
    .collapseBtnBg {
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
    }
    .collapseBtnBgC {
      background-image: url('${matIconsUrl}keyboard_arrow_down_white_20dp.png');
    }
    .collapseBtnBgE {
      background-image: url('${matIconsUrl}keyboard_arrow_up_white_20dp.png');
    }
    `;
  document.head.insertAdjacentHTML('beforeend', `<style>${stylesheet}</style>`);

  const gmtt = {
    intWait: 250,
    maxWait: 15000,
    totalWait: 0,
    baseUrl: null,
    customTabsContainer: null,
    customTabBar: null,
    selected: null,
    collapsed: true,
    resizeTimeout: false,
    tabsConfig: [{ //Tabs configuration object
      id: 'inbox',
      query: 'inbox',
      label: 'Inbox',
      icon: `${matIconsUrl}mail_white_20dp.png`
    }, {
      id: 'starred',
      query: 'in:inbox is:starred',
      label: 'Starred',
      icon: `${matIconsUrl}star_white_20dp.png`
    }, {
      id: 'regular',
      query: 'in:inbox -is:starred',
      label: 'Regular',
      icon: `${matIconsUrl}all_inbox_white_20dp.png`
    }, {
      id: 'security',
      query: 'in:inbox label:security',
      label: 'Security',
      icon: `${matIconsUrl}security_white_20dp.png`
    }, {
      id: 'alerts',
      query: 'in:inbox label:alerts',
      label: 'Alerts',
      icon: `${matIconsUrl}warning_amber_white_20dp.png`
    }, {
      id: 'apartment',
      query: 'in:inbox label:apartment',
      label: 'Apartment',
      icon: `${matIconsUrl}apartment_white_20dp.png`
    }, {
      id: 'finance',
      query: 'in:inbox label:finance',
      label: 'Finance',
      icon: `${matIconsUrl}account_balance_white_20dp.png`
    }, {
      id: 'purchases',
      query: 'in:inbox label:purchases',
      label: 'Purchases',
      icon: `${matIconsUrl}shopping_cart_white_20dp.png`
    }, {
      id: 'shipping',
      query: 'in:inbox label:shipping',
      label: 'Shipping',
      icon: `${matIconsUrl}local_shipping_white_20dp.png`
    }, {
      id: 'recruitment',
      query: 'in:inbox label:recruitment',
      label: 'Recruitment',
      icon: `${matIconsUrl}work_white_20dp.png`
    }, {
      id: 'patreon',
      query: 'in:inbox label:patreon',
      label: 'Patreon',
      icon: `${matIconsUrl}toll_white_20dp.png`
    }, {
      id: 'networkAlerts',
      query: 'in:inbox label:network-alerts',
      label: 'Network Alerts',
      icon: `${matIconsUrl}lan_white_20dp.png`
    }, {
      id: 'social',
      query: 'in:inbox {category:social label:social}',
      label: 'Social',
      icon: `${matIconsUrl}people_white_20dp.png`
    }, {
      id: 'forums',
      query: 'in:inbox category:forums',
      label: 'Forums',
      icon: `${matIconsUrl}forum_white_20dp.png`
    }, {
      id: 'promotions',
      query: 'in:inbox category:promotions',
      label: 'Promotions',
      icon: `${matIconsUrl}local_offer_white_20dp.png`
    }, {
      id: 'recentCalls',
      query: 'label:(-phone {phone-call-log phone-google-voice})',
      label: 'Recent Calls',
      icon: `${matIconsUrl}phone_in_talk_white_20dp.png`
    }, {
      id: 'recentSms',
      query: 'label:({-im -phone} {phone-sms phone-mms})',
      label: 'Recent SMS',
      icon: `${matIconsUrl}sms_white_20dp.png`
    }, {
      id: 'attachment',
      query: 'attach_or_drive=true',
      label: 'Attachment',
      icon: `${matIconsUrl}attachment_white_20dp.png`
    }, {
      id: 'documents',
      query: '{from:docusign.net "docs.google.com" has:document has:pdf filename:{txt rtf doc docx odt fodt pages pages-tef xls xlsx ods fods numbers numbers-tef ppt pptx pps ppsx odp fodp key keynote key-tef pdf ps epub mobi azw azw3 kfx kpf cbz cbr}}',
      label: 'Documents',
      icon: `${matIconsUrl}description_white_20dp.png`
    }, {
      id: 'images',
      query: '{has:image filename:{bmp png jpg jpeg jp2 gif webp apng avif tiff emf wmf ai svg xcf psd heic raw dng arw}}',
      label: 'Images',
      icon: `${matIconsUrl}image_white_20dp.png`
    }, {
      id: 'videos',
      query: '{has:video filename:{avi mov qt mpg mpeg mp4 m4p m4v mkv webm flv vob ogv ogg wmv rm rmvb asf 3gp mts m2ts ts}}',
      label: 'Videos',
      icon: `${matIconsUrl}ondemand_video_white_20dp.png`
    }],
    shouldDisplay: (hash, numSegments) => {
      return hash.length == numSegments || (hash.length == numSegments + 1 && /p\d+/.test(hash[hash.length - 1]));
    },
    updateHeight: () => {
      const customTabsContainerHeight = getComputedStyle(document.getElementById('customTabsContainer')).height;
      document.querySelectorAll('.S4').forEach(el => { el.style.height = `calc(100vh - 64px - 16px - ${customTabsContainerHeight})`; });
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
        case 'advanced-search': {
          display = gmtt.shouldDisplay(hash, 2);
          const isrefinementRegexp = new RegExp(`(${isrefinementParam})$`);
          query = decodeURIComponent(hash[1]).replace(isrefinementRegexp, '').replace(/[\u002B]/g, ' ');
          break;
        }
      }

      if (display) {
        const tabCfg = gmtt.tabsConfig.find(tCfg => tCfg.query == query);
        if (tabCfg) {
          gmtt.selected = tabCfg.id;
        } else {
          gmtt.selected = null;
        }
      }

      let tabParent = false;
      if (hash == 'inbox') {
        tabParent = document.querySelector('div.bGI.nH.oy8Mbf.aE3.S4 > div.aKh');
        if (tabParent) {
          tabParent.style.height = 'fit-content';
          tabParent.querySelector('.aKk').style.height = 'auto';
        }
      } else {
        tabParent = document.querySelector('.AO');
      }
      if (tabParent && document.querySelector('.vX.UC').offsetParent === null) {
        //console.log('*************** Tab Parent found');
        gmtt.totalWait = 0;
        if (!display) {
          if (gmtt.customTabsContainer && !gmtt.customTabsContainer.classList.contains('displayNone')) {
            gmtt.customTabsContainer.classList.add('displayNone');
          }
        } else {
          if (gmtt.customTabsContainer) {
            if (gmtt.customTabsContainer.classList.contains('displayNone')) {
              gmtt.customTabsContainer.classList.remove('displayNone');
            }
            gmtt.customTabsContainer.querySelectorAll('.customTab').forEach(customTab => {
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
                url += `#advanced-search/${encodeURIComponent(tabCfg.query)}${isrefinementParam}`;
              } else {
                url += `#search/${encodeURIComponent(tabCfg.query)}`;
              }
              const anchor = document.createElement('a');
              anchor.id = `ct-a-${tabCfg.id}`;
              anchor.href = url;
              anchor.setAttribute('target', '_top');
              anchor.setAttribute('aria-label', tabCfg.label);
              anchor.setAttribute('tabindex', -1);
              anchor.setAttribute('draggable', false);

              const aIcon = document.createElement('div');
              aIcon.className = 'customTabIcon';
              aIcon.style.backgroundImage = `url('${tabCfg.icon}')`;
              anchor.append(aIcon);

              const aLabel = document.createElement('div');
              aLabel.innerText = tabCfg.label;
              anchor.append(aLabel);

              tab.append(anchor);
              fragment.append(tab);
            });
            gmtt.customTabBar.append(fragment);

            window.addEventListener('hashchange', gmtt.init);
            window.addEventListener('resize', () => {
              clearTimeout(gmtt.resizeTimeout);
              gmtt.resizeTimeout = setTimeout(gmtt.updateHeight, 250);
            });
          }
          if (!gmtt.customTabsContainer) {
            gmtt.customTabsContainer = document.createElement('div');
            gmtt.customTabsContainer.id = 'customTabsContainer';
            gmtt.customTabsContainer.append(gmtt.customTabBar);

            const collapseBtn = document.createElement('div');
            collapseBtn.className = 'a5B Yn collapseBtn';
            const collapseBtnBg = document.createElement('span');
            collapseBtnBg.className = 'a5D collapseBtnBg collapseBtnBgC';
            collapseBtn.addEventListener('click', () => {
              if(gmtt.collapsed) {
                collapseBtnBg.classList.remove('collapseBtnBgC');
                collapseBtnBg.classList.add('collapseBtnBgE');
                gmtt.customTabBar.classList.remove('customTabsC');
                gmtt.customTabBar.classList.add('customTabsE');
              } else {
                collapseBtnBg.classList.remove('collapseBtnBgE');
                collapseBtnBg.classList.add('collapseBtnBgC');
                gmtt.customTabBar.classList.remove('customTabsE');
                gmtt.customTabBar.classList.add('customTabsC');
              }
              gmtt.collapsed = !gmtt.collapsed;
              gmtt.updateHeight();
            });
            collapseBtn.append(collapseBtnBg);
            gmtt.customTabsContainer.append(collapseBtn);
          }
          gmtt.customTabsContainer.classList.add('customTabsContainer');
          if (!gmtt.customTabsContainer.parentNode || gmtt.customTabsContainer.parentNode != tabParent) {
            tabParent.prepend(gmtt.customTabsContainer);
          }
        }
        gmtt.updateHeight();
      } else if (gmtt.totalWait < gmtt.maxWait) {
        //console.warn('*************** Tab Parent not found yet');
        window.setTimeout(gmtt.init, gmtt.intWait);
      } else {
        console.error('*************** Tab Parent was never found and the future refused to change :-(');
      }
      return this;
    }
  };
  gmtt.init();
})();