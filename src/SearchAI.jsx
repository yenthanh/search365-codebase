import {MagnifyingGlassIcon, XMarkIcon} from "@heroicons/react/24/outline";
import React, {useState} from "react";
// import { useNavigate } from "react-router-dom";
import "./AISearch.css";

const SearchAI = (props) => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const [category, setCategory] = useState("");
  // const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      // navigate(`/search?keywords=${searchInput}&category=${category}`);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = async (event) => {
    const newInput = event.target.value;
    setSearchInput(newInput);
    setActiveIndex(-1);

    if (newInput.trim()) {
      try {
        const response = await fetch(
          props.suggestionApiUrl
            ? props.suggestionApiUrl + `${encodeURIComponent(newInput)}`
            : `https://nab-demo-ae-api.azurewebsites.net/search/all_semantic/categorized-suggested/${encodeURIComponent(
                newInput,
              )}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({numSuggestedSearches: 10}),
          },
        );

        const data = await response.json();

        if (data.isSuccess && data.body && data.body.categorizedSuggested) {
          const categorizedSuggested = data.body.categorizedSuggested;

          const allSuggestionsWithCategories = Object.entries(
            categorizedSuggested,
          ).map(([category, suggestions]) => ({
            category,
            suggestions,
          }));
          setSuggestions(allSuggestionsWithCategories);
        } else {
          console.error("Failed to fetch suggested searches. Response:", data);
        }
      } catch (error) {
        console.error("Error fetching suggested searches:", error);
      }
    }
  };

  const getAllSuggestions = () => {
    return suggestions.flatMap((categoryItem) => categoryItem.suggestions);
  };

  const handleKeyDown = (event) => {
    const allSuggestions = getAllSuggestions();
    if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < allSuggestions.length) {
        const suggestion = allSuggestions[activeIndex];
        setSearchInput(suggestion);
        // navigate(`/search?keywords=${searchInput}&category=${category}`);
        setSuggestions([]);
      } else {
        handleSearch();
      }
    } else if (event.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % allSuggestions.length);
    } else if (event.key === "ArrowUp") {
      setActiveIndex(
        (prev) => (prev - 1 + allSuggestions.length) % allSuggestions.length,
      );
    }
  };

  return (
    <div className='search-box-parent'>
      <div className='flex items-center'>
        {showSearch && (
          <div className='search-box-container'>
            <div>
              <input
                type='text'
                className={props.inputCss ? props.inputCss : "ai-search-input"}
                placeholder={
                  props.placeholder
                    ? props.placeholder
                    : "Ask a question or Search?"
                }
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />

              {suggestions.length > 0 && (
                <ul className='suggestions-list'>
                  {suggestions.map((categoryItem, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      {categoryItem.category.length > 0 && (
                        <li className='category-item'>
                          <span className='font-bold'>
                            {categoryItem.category}
                          </span>
                        </li>
                      )}
                      {categoryItem.suggestions.map((suggestion, index) => {
                        const globalIndex =
                          suggestions
                            .slice(0, categoryIndex)
                            .reduce(
                              (acc, item) => acc + item.suggestions.length,
                              0,
                            ) + index;
                        return (
                          <li
                            key={index}
                            className={`suggestion-item ${
                              globalIndex === activeIndex
                                ? "suggestion-item-background"
                                : ""
                            }`}
                            onClick={() => {
                              setSearchInput(suggestion);
                              setCategory(categoryItem.category);
                              // navigate(
                              //   `/search?keywords=${suggestion}&category=${categoryItem.category}`,
                              // );
                              setSuggestions([]);
                            }}
                          >
                            <span>{suggestion}</span>
                          </li>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </ul>
              )}
            </div>
            <MagnifyingGlassIcon
              width={25}
              height={25}
              color='white'
              className='cursor-pointer'
              onClick={handleSearch}
            />
          </div>
        )}
        <div
          className='magnifying-icon-class'
          onClick={() => {
            if (showSearch) {
              setSearchInput("");
            }
            setShowSearch(!showSearch);
          }}
        >
          {showSearch ? (
            <XMarkIcon width={25} height={25} color='white' />
          ) : (
            <MagnifyingGlassIcon width={25} height={25} color='white' />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAI;
