/** 
 * RECOMMENDATION
 * 
 * To test your code, we recommend opening this file in a web browser.
 * You can then use the "Developer Tools" to see the Javascript console.
 * There, you will see the results of the tests executing.
 * 
 * The Developer Tools in Chrome are available under the "..." menu, 
 * futher hidden under the option "More Tools." In Firefox, they are 
 * under the hamburger (three horizontal lines), also hidden under "More Tools." 
 */

/**
 * Searches for matches in scanned text.
 * @param {string} searchTerm - The word or term we're searching for. 
 * @param {JSON} scannedTextObj - A JSON object representing the scanned text.
 * @returns {JSON} - Search results.
 * */

class books {
    constructor(books) {
        this.Books = [];
        for (var i in books) {
            this.Books.push(new book(books[i]));
        }
    }
}
class book {
    constructor(book) {
        this.ISBN = book.ISBN
        this.Title = book.Title
        this.Content = book.Content
        this.line_words = this.parse_lines()
    }
    parse_lines() {
        let lines = [];
        for (let l in this.Content) {
            lines[l] = {
                "Page": this.Content[l].Page,
                "Line": this.Content[l].Line,
                "Text": this.Content[l].Text,
            }
            let words = [];
            // split the line up by matching on wordlike blocks
            let lowercaseWords = lines[l].Text.toLowerCase();
            let splitLine = lowercaseWords.match(/[a-z'\-]+/gi);
            lines[l].Words = splitLine;
        }
        // take a second pass for wrapped words
        for (var l in lines) {
            // if we end the line with a char and a -, consider that a wrapped word
            if (lines[l].Text.match(/[a-z]\-$/gi)) {
                // unless we're on the last line
                if (l < lines.length - 1) {
                    let thisLine = lines[l];
                    let nextLine = lines[Number(l) + 1];
                    let nextWordFrag = nextLine.Words[0];
                    let lastWordIdx = Number(lines[l].Words.length) - 1;
                    let lastWord = thisLine.Words[lastWordIdx];
                    lastWord = lastWord.replace(/\-$/, '')
                    // finally, concatenate them
                    lines[l].Words[lastWordIdx] = lastWord + nextWordFrag;
                }
            }
        }

        return lines;
    }
    // takes a search term and returns a list of results in the proper form
    search_for(searchterm) {
        let results = []
        for (let l in this.line_words) {
            let words = this.line_words[l].Words;
            if (words.includes(searchterm)) {
                results.push({
                    "ISBN": this.ISBN,
                    "Page": this.Content[l].Page,
                    "Line": this.Content[l].Line
                })
            }
        }
        return results;
    }

}

// high-level function that searches an object for a search term, line by line
function findSearchTermInBooks(searchTerm, scannedTextObj) {
    // create a list of book objects from scannedTextObj
    theseBooks = new books(scannedTextObj);

    // traverse scannedTextObj
    let result = {
        "SearchTerm": `${searchTerm}`,
    };
    let results = [];
    for (let i in theseBooks.Books) {
        let thisBook = theseBooks.Books[i];
        thisBookResults = thisBook.search_for(searchTerm);
        if (thisBookResults.length > 0) {
            results = results.concat(thisBookResults);
        }
    }
    result.Results = results;
    return result;
}

/*
    input object.
    bklaas: renamed input to bookObjects to be more descriptive
    bklaas: added a second book
    bklaas: added an empty object to handle the zero case for Books
    bklaas: added an empty Content to handle the zero case for Content
*/
const noBooks = []
const noContent = [
    {
        "Title": "Zen and the Art of Motorcycle Maintenance",
        "ISBN": "999999999999",
        "Content": []
    }
]
const bookObjects = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            },
            {
                "Page": 31,
                "Line": 11,
                "Text": "this is a bunch of sample text added by Ben Klaas to"
            },
            {
                "Page": 31,
                "Line": 12,
                "Text": "add some areas where more things could be returned"
            },
            {
                "Page": 31,
                "Line": 13,
                "Text": "for example, I am repeating the word bunch here"
            },
        ]
    },
    {
        "Title": "Moby Dick",
        "ISBN": "123456789001",
        "Content": [
            {
                "Page": 1,
                "Line": 1,
                "Text": "Loomings."
            },
            {
                "Page": 1,
                "Line": 2,
                "Text": "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in"
            },
            {
                "Page": 1,
                "Line": 3,
                "Text": "my purse, and nothing particular to interest me on shore, I thought I would sail about a little and"
            },
            {
                "Page": 1,
                "Line": 4,
                "Text": "see the watery part of the world. It is a way I have of driving off the spleen and regulating the"
            },
        ]
    }
]

/* while not particularly interesting, searching against these
   zero objects should not result in an error
*/
const expectedReturnFor_noBooks = {
    "SearchTerm": "the",
    "Results": []
}

const expectedReturnFor_noContent = {
    "SearchTerm": "the",
    "Results": []
}

// expected return for the search string "the"
// note: this will match on lines with The and the
const expectedReturnFor_the = {
    "SearchTerm": "the",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        },
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 9
        },
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 13
        },
        {
            "ISBN": "123456789001",
            "Page": 1,
            "Line": 4
        }
    ]
}

// expected return for the search string "foobar", which has no matches
const expectedReturnFor_foobar = {
    "SearchTerm": "foobar",
    "Results": []
}

// expected return for the search string "darkness", which has one match across two lines
const expectedReturnFor_darkness = {
    "SearchTerm": "darkness",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        }
    ]
}

function testReturnedResults(helptext, received, expected) {
    checkSizeSame(helptext, received, expected);
    checkJsonSame(helptext, received, expected);
}

function checkJsonSame(helptext, received, expected) {
    if (JSON.stringify(received) === JSON.stringify(expected)) {
        console.log("PASS: Test Expected and Received SAME: " + helptext);
    } else {
        console.log("FAIL: Test Expected and Received SAME: " + helptext);
        console.log("Expected:", expected);
        console.log("Received:", received);
    }
}

function checkSizeSame(helptext, received, expected) {
    if (received.Results.length == expected.Results.length) {
        console.log("PASS: Test checkSizeSame " + helptext);
        console.log("Expected:", expected.Results.length);
        console.log("Received:", received.Results.length);
    } else {
        console.log("FAIL: Test checkSizeSame");
        console.log("Expected:", expected.Results.length);
        console.log("Received:", received.Results.length);
    }
}

const resultFor_the = findSearchTermInBooks("the", bookObjects);
const resultFor_darkenss = findSearchTermInBooks("darkness", bookObjects);
const resultFor_foobar = findSearchTermInBooks("foobar", bookObjects);
const resultFor_noBooks = findSearchTermInBooks("the", noBooks);
const resultFor_noContent = findSearchTermInBooks("the", noContent);
testReturnedResults("search term 'the' (multiple hits across books)",
    resultFor_the, expectedReturnFor_the)
testReturnedResults("search term 'darkness' (wrapped word)",
    resultFor_darkenss, expectedReturnFor_darkness)
testReturnedResults("search term 'foobar' (zero hits)",
    resultFor_foobar, expectedReturnFor_foobar)
testReturnedResults("test against zero books",
    resultFor_noBooks, expectedReturnFor_noBooks)
testReturnedResults("test against zero content",
    resultFor_noContent, expectedReturnFor_noContent)