import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';
import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { SearchContext } from './SearchContext';

const QuestionList = ({ questions }) => {
    const isSingleColumn = questions.length <= 4;
    const { setSearchInput } = useContext(SearchContext);
    const navigate = useNavigate();

    const handleSearch = async (question) => {
        try {
            navigate(`/search?keywords=${question}`);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div className='flex'>
            <div className={`${isSingleColumn ? 'flex-col' : 'flex-row'} flex items-center mb-3 space-x-5`}>
                {Array.from({ length: isSingleColumn ? 1 : 2 }, (_, columnIndex) => (
                    <div key={columnIndex} className='flex-col items-center space-y-2'>
                        {questions
                            .slice(columnIndex * 4, columnIndex * 4 + 4)
                            .map((question, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-100 cursor-pointer hover:underline py-1 px-6 rounded-lg w-72"
                                    onClick={() => {
                                        handleSearch(question);
                                        setSearchInput(question);
                                    }}
                                >
                                    <div
                                        className='w-64 overflow-hidden pr-2'
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            height: '40px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            lineHeight: '20px' // Ensures line height matches the height
                                        }}
                                        title={question}
                                    >
                                        {question}
                                    </div>
                                    <MagnifyingGlassCircleIcon width={20} />
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;
