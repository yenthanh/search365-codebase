import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import QuestionList from "./QuestionList";

const SearchResult = (props) => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [bodyResults, setBodyResults] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const keyWords = searchParams.get("keywords");
    const category = searchParams.get("category");
    const [categoryNavigator, setCategoryNavigator] = useState(null);
    const [allCountDisplay, setAllCountDisplay] = useState();
    const [isSearchWithFilter, setIsSearchWithFilter] = useState(false);
    const [filterItemDisplayName, setFilterItemDisplayName] = useState();

    const [questions, setQuestions] = useState([]);
    const [answer, setAnswer] = useState("");
    const [reference, setReference] = useState("");
    const [qaData, setQaData] = useState([]);

    const handleGetData = async (keyWords) => {
        try {
            setLoading(true);
            const fetchUrl = props.searchApiUrl
                ? props.searchApiUrl
                : "https://nab-demo-ae-api.azurewebsites.net/hybrid-search?issearchadmin=false";
            const response = await fetch(
                fetchUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        profile: "hybrid_semantic",
                        query: keyWords,
                        pageSize,
                        page: page + 1,
                    }),
                }
            );
            const data = await response.json();

            setLoading(false);
            setResults(data);
            setBodyResults(data.body.results);
            setPageCount(Math.ceil(data?.body?.resultsCount / pageSize));
            setAllCountDisplay(data?.body?.resultsCount);
            const categoryNavigator = data?.body?.navigators?.find(
                (nav) => nav.name === "category"
            );
            if (categoryNavigator) {
                setCategoryNavigator(categoryNavigator);
            }
            setQuestions(
                data.body.results[0].questions_answers.slice(1).map((qa) => qa.question)
            );

            if (data.body.answers[0]) {
                setAnswer(data.body.answers[0]["highlights"]);
                console.log("answer:", answer);
                setReference(bodyResults[0]?.url);
            } else {
                const questionsAndAnswers = data.body.results
                    .flatMap((result) => result.questions_answers)
                    .map((qa) => ({
                        question: qa.question,
                        answer: qa.answer,
                    }));

                setQaData(questionsAndAnswers);
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const handleGetFilterData = async (keyWords, itemDisplayName) => {
        try {
            setLoading(true);
            const fetchUrl = props.searchApiUrl
                ? props.searchApiUrl
                : "https://nab-demo-ae-api.azurewebsites.net/hybrid-search?issearchadmin=false";
            const response = await fetch(fetchUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    profile: "hybrid_semantic",
                    query: keyWords,
                    filterData: itemDisplayName
                        ? `( category eq '${itemDisplayName}')`
                        : "",
                    pageSize,
                    page: page + 1,
                }),
            });
            const data = await response.json();

            setLoading(false);
            setResults(data);
            setBodyResults(data.body.results);
            setPageCount(Math.ceil(data?.body?.resultsCount / pageSize));
            setIsSearchWithFilter(true);
            setFilterItemDisplayName(itemDisplayName || "");
            setAllCountDisplay(data?.body?.resultsCount);
            // const categoryNavigator = data?.body?.navigators?.find(nav => nav.name === 'category');
            // if (categoryNavigator) {
            //   setCategoryNavigator(categoryNavigator);
            // }
            setQuestions(
                data.body.results[0].questions_answers.slice(1).map((qa) => qa.question)
            );

            if (data.body.answers[0]) {
                setAnswer(data.body.answers[0]["highlights"]);
                console.log("answer:", answer);
                setReference(bodyResults[0]?.url);
            } else {
                const questionsAndAnswers = data.body.results
                    .flatMap((result) => result.questions_answers)
                    .map((qa) => ({
                        question: qa.question,
                        answer: qa.answer,
                    }));

                setQaData(questionsAndAnswers);
            }
        } catch (error) {
            console.error("Error fetching filter data:", error);
            setLoading(false);
        }
    };

    function Items({ currentItems }) {
        return (
            <>
                <div className="mb-4 ">
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <div key={index} className="mb-4">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="search-result-link"
                                >
                                    {item.title}
                                </a>
                                <p
                                    dangerouslySetInnerHTML={{ __html: item.body }}
                                    className="text-gray-500"
                                />
                            </div>
                        ))
                    ) : (
                        <p>No items found.</p> // Optional: show a message if there are no items
                    )}
                </div>
            </>
        );
    }

    useEffect(() => {
        const fetchData = async () => {
            if (keyWords || page) {
                if (category) {
                    await handleGetData(keyWords);

                    const selectedCategory = categoryNavigator?.items?.find(
                        (item) => item.displayName === category
                    );

                    if (selectedCategory) {
                        setActiveIndex(
                            categoryNavigator?.items?.findIndex(
                                (item) => item.displayName === category
                            )
                        );
                    }
                    await handleGetFilterData(keyWords, category);
                    setIsSearchWithFilter(false);
                    setFilterItemDisplayName("");
                } else {
                    await handleGetData(keyWords);
                }
            }
        };

        fetchData();
    }, [page, keyWords, category]);

    const handleFilterDataClick = (itemDisplayName) => {
        if (keyWords && itemDisplayName) {
            handleGetFilterData(keyWords, itemDisplayName);
        }
    };

    const handleItemClick = (index, displayName) => {
        setActiveIndex(index);
        setPage(0);
        handleFilterDataClick(displayName);
    };

    const handlePageClick = ({ selected }) => {
        setPage(selected);
        setFilterItemDisplayName("");
    };

    const handleAnswer = (keyword) => {
        const index = qaData.findIndex((qa) => qa.question === keyword);
        if (index !== -1) {
            setAnswer(qaData[index].answer);
            setReference(bodyResults[~~(index / pageSize)].url);
        } else {
            setAnswer();
        }
    };

    useEffect(() => {
        handleAnswer(keyWords, bodyResults);
    }, [qaData]);

    useEffect(() => {
        console.log(reference);
    }, [reference]);

    return (
        <>
            <div className="search-result-parent">
                <div className="search-result-text">{props.searchTitle ? props.searchTitle : "SEARCH"}</div>

                <div className="flex-1 ">
                    <ul className="search-content-pos">
                        <li
                            className={`search-result-content ${activeIndex === -1
                                ? props.categorySelectionCss ? props.categorySelectionCss : "search-result-content-active"
                                : ""
                                }`}
                        >
                            <a href="#" className="search-result-category"
                                onClick={() => {
                                    setActiveIndex(-1);
                                    handleGetData(keyWords);
                                    setPage(0);
                                }}
                            >
                                <span className={props.categoryTextCss ? props.categoryTextCss : "search-category-text"}>
                                    All results
                                </span>
                                <div className="group">
                                    <span
                                        className={`search-category-count ${activeIndex === -1
                                            ? props.categoryCountCss ? props.categoryCountCss : "search-category-count-active"
                                            : "search-category-count-inactive"
                                            }`}
                                    >
                                        {allCountDisplay}
                                    </span>
                                </div>
                            </a>
                        </li>
                        {categoryNavigator?.items?.map((item, index) => (
                            <li
                                key={index}
                                className={`search-result-content ${activeIndex === index
                                    ? props.categorySelectionCss ? props.categorySelectionCss : "search-result-content-active"
                                    : ""
                                    }`}
                                onClick={() => handleItemClick(index, item.displayName)}
                                style={{ cursor: "pointer" }}
                            >
                                <a
                                    href="#"
                                    className="search-result-category"
                                    onClick={() => handleFilterDataClick(item.displayName)}
                                >
                                    <span className={props.categoryTextCss ? props.categoryTextCss : "search-category-text"}>
                                        {item.displayName}
                                    </span>
                                    <span
                                        className={`search-category-count  ${activeIndex === index
                                            ? props.categoryCountCss ? props.categoryCountCss : "search-category-count-active"
                                            : "search-category-count-inactive"
                                            }`}
                                    >
                                        {item.count}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {loading && (
                <div className="px-96 pt-[100px] bg-white">{props.loadingText ? props.loadingText : "Loading Result..."}</div>
            )}
            {!loading && (
                <>
                    <div className="bg-white text-black  pl-[200px]">
                        <div className="py-[30px]">
                            Showing <b>{page === 0 ? 1 : page * pageSize + 1}</b> to{" "}
                            <b>{(page + 1) * pageSize}</b> results of{" "}
                            {results?.body?.resultsCount} for keywords <b>{keyWords}</b>.
                        </div>
                        {answer && answer.length > 0 && (
                            <div className="mb-4 w-[600px] bg-gray-100 rounded-lg p-6">
                                <p className="font-semibold text-xl mb-2">Answer:</p>
                                <div dangerouslySetInnerHTML={{ __html: answer }} />
                                <a
                                    style={{ color: "#1F4F82" }}
                                    href={reference === "" ? bodyResults[0]?.url : reference}
                                    target="_blank"
                                >
                                    [Reference]
                                </a>
                            </div>
                        )}
                        {results?.body?.featured && results.body.featured.length > 0 && (
                            <div className="bg-[#f5f5f5] p-[25px] mb-[30px]">
                                {results?.body?.featured?.map((result, index) => (
                                    <div key={index}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: result.content
                                                    .replace(
                                                        /<a(?![^>]*class="button")(.*?)>/gi,
                                                        '<h2><a class="text-blue-500 underline" $1>'
                                                    )
                                                    .replace(/<\/a>/gi, "</a></h2>")
                                                    .replace(
                                                        /<a(.*?)class="button"(.*?)>/gi,
                                                        '<a $1class="flex items-center px-7 rounded-md py-2 justify-center bg-[#be0c00] cursor-pointer hover:opacity-80 text-white w-[150px] mt-[15px]" $2>'
                                                    ),
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Items currentItems={bodyResults} />
                        {questions && questions.length > 0 && (
                            <div>
                                <p className="text-black font-semibold text-2xl mb-6 mt-3">
                                    People also asking about . . .
                                </p>
                                <QuestionList questions={questions} />
                            </div>
                        )}
                        <div className="mb-5">
                            <ReactPaginate
                                nextLabel="next >"
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={3}
                                marginPagesDisplayed={2}
                                pageCount={pageCount}
                                previousLabel="< previous"
                                pageClassName="page-item"
                                pageLinkClassName="page-link"
                                previousClassName="page-item"
                                previousLinkClassName="page-link"
                                nextClassName="page-item"
                                nextLinkClassName="page-link"
                                breakLabel="..."
                                breakClassName="page-item"
                                breakLinkClassName="page-link"
                                containerClassName="pagination"
                                activeClassName="active"
                                renderOnZeroPageCount={null}
                                initialPage={page}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default SearchResult;
