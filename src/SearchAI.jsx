import React from "react";
import "./AISearch.css";
import AISearch from "./AISearch";
import { Route, Routes } from "react-router-dom";
import SearchResult from "./SearchResult";

const SearchAI = (props) => {
  return (
    <>
      <div className="search-provider">
        <AISearch
          placeholder={props.placeholder}
          inputCss={props.inputCss}
          suggestionApiUrl={props.suggestionApiUrl}
        />
        <Routes>
          <Route path="/search" element={
            <SearchResult loadingText={props.loadingText}
              categoryTextCss={props.categoryTextCss}
              categoryCountCss={props.categoryCountCss}
              categorySelectionCss={props.categorySelectionCss}
              searchApiUrl={props.searchApiUrl}
              searchTitle={props.searchTitle} />
          } />
        </Routes>
      </div>
    </>
  )
};

export default SearchAI;
