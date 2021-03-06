import selectorProvider from './selector.provider';
import check from './cssLiveChecker';
import dataStore from './dataStoreProviders/dataStore';
import { canCheckPage, markThisPageAsCheck } from './canCheckPage';

const url = new URL(document.currentScript.src);
const dir = url.pathname.replace(/([a-z0-9-._]+).js/, "");
__webpack_public_path__ = (dir + __webpack_public_path__);

const pageKey = location.pathname;

//resolve storage provider
switch (window.cssClear.dataStoreProvider.name) {
  case "firebase":
    import(`./dataStoreProviders/firebaseStorage`).then(doAction);
    break;
  case "postData":
    import(`./dataStoreProviders/postStorage`).then(doAction);
    break;  
  default: 
    import(`./dataStoreProviders/firebaseStorage`).then(doAction);
}




function doAction(storageClass) {
  const store = new storageClass.default(window.cssClear);
  function parse(_store, key) {
    const cssSelectorProvider = new selectorProvider(window.cssClear.pathToSelectors);
    cssSelectorProvider.fetchData().then((selectors) => {
      const live = selectors.filter(selector => check(selector));
      new dataStore(_store).save(live);
      markThisPageAsCheck(key);
    });
  }
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (canCheckPage(pageKey)) {
        parse(store, pageKey);
      } else {
        console.info('You already check this page');
      }
    }, 2000);
  });
  document.addEventListener("startCSSClean", () => {
    parse(store, pageKey);
  });
}
