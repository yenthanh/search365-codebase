import React from "react";
import "./index.css";
import "./AISearch.css";
import SearchAI from "./SearchAI";

function App() {
  return (
    <>
      <SearchAI inputCss="ai-search-input"
        categoryTextCss="search-category-text"
        categoryCountCss="search-category-count-active"
        placeholder="Ask Us"
        suggestionApiUrl={`https://nab-demo-ae-api.azurewebsites.net/search/all_semantic/categorized-suggested/}`}
        searchApiUrl={`https://nab-demo-ae-api.azurewebsites.net/hybrid-search?issearchadmin=false`}
        searchTitle="SEARCH"
        categorySelectionCss="search-result-content-active"
        loadingText="Loading..." />
    </>
  );
}

export default App;
