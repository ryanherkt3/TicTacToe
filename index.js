class Game {
    moves;
    gameOver;

    aiRandomness;
    playerLetter;
    aiLetter;
    playerPrevSquareNo;
    aiPrevSquareNo;

    $game;
    $square;
    $messages;
    $playAgainBtn;
    $numberGuess;
    $aiDifficulty
    $options;

    constructor() {
        this.moves = 0;
        this.gameOver = false;
        
        this.aiRandomness = false;
        this.playerLetter;
        this.aiLetter;
        this.playerPrevSquareNo;
        this.aiPrevSquareNo;

        this.$game = $(".game");
        this.$square = $(".square", this.$game);
        this.$messages = $(".messages");
        this.$playAgainBtn = $(".play-again.button");
        this.$numberGuess = $(".number-guess");
        this.$aiDifficulty = $(".ai-difficulty");
        this.$options = $(".option", this.$aiDifficulty);

        $(".button", this.$numberGuess).on("click", (e) => {
            const $choice = $(e.currentTarget);
            const randomNumber = Math.floor(Math.random() * 10) + 1; // 1 to 10

            const correctChoice = (randomNumber < 6 && $choice.hasClass("lower")) || 
                (randomNumber >= 6 && $choice.hasClass("higher"));

            this.playerLetter = correctChoice ? "X" : "O";
            this.aiLetter = !correctChoice ? "X" : "O";

            $(".player-first").toggleClass("hidden", !correctChoice);
            $(".ai-first").toggleClass("hidden", correctChoice);
            
            this.$game.removeClass("hidden");
            this.$numberGuess.addClass("hidden");
            this.$aiDifficulty.addClass("hidden");

            if (!correctChoice) {
                setTimeout(() => {
                    this.aiTurn();
                    this.moves++;
                }, 1500);
            }
            else {
                this.$game.removeClass("locked");
            }
        });

        this.$options.on("click", (e) => {
            const $option = $(e.currentTarget);

            $(".dot", this.$options).addClass("hidden");
            $(".dot", $option).removeClass("hidden");

            this.aiRandomness = $option.hasClass("yes");
        });

        this.$square.on("click", (e) => {
            const $clickedSquare = $(e.currentTarget);
            
            const squareNo = this.$square.index($clickedSquare);
            const squareIsAvailable = !($clickedSquare.hasClass("player")) && !($clickedSquare.hasClass("ai"));
    
            if (squareIsAvailable && !(this.$game.hasClass("locked"))) {
                if (!this.gameOver) {
                    this.playerPrevSquareNo = squareNo;
                    this.moves++;

                    this.$messages.children().addClass("hidden");

                    $clickedSquare.addClass("player").text(this.playerLetter);
                
                    if (this.moves > 4) {
                        this.gameOver = this.checkForWin(squareNo, "player");
                        
                        if (this.gameOver) {
                            $(".winner.player").removeClass("hidden");
                        }
                    }
                    if (this.moves < 9 && !this.gameOver) {
                        this.$game.addClass("locked");
                        let aiSquareNo = this.aiTurn();
                        this.moves++;

                        if (this.moves > 4) {
                            this.gameOver = this.checkForWin(aiSquareNo, "ai");
                            
                            if (this.gameOver) {
                                $(".winner.ai").removeClass("hidden");
                            }
                        }
                    }
                }
            }
            else if (!squareIsAvailable && !this.gameOver) {
                $(".square-taken").removeClass("hidden");
            }
            else if (this.$game.hasClass("locked")) {
                $(".wait-turn").removeClass("hidden");
            }
            
            if (this.moves == 9 && !this.gameOver) {
                this.gameOver = true;
                $(".draw").removeClass("hidden");
            }
            
            if (this.gameOver) {
                this.$game.addClass("done");
                this.$playAgainBtn.removeClass("hidden");
            }
        });

        this.$playAgainBtn.on("click", (e) => {
            this.$game.removeClass("done").addClass("hidden locked");
            this.$messages.children().addClass("hidden");
            this.$playAgainBtn.addClass("hidden");
            
            this.$square.text("").removeClass("player ai");
            
            this.$aiDifficulty.removeClass("hidden");
            this.$numberGuess.removeClass("hidden");

            this.moves = 0;
            this.gameOver = false;
        });
    }
    
    /**
     * A function which allows the computer to "click" a square.
     *  
     * @returns square number the computer picked (0 to 8).
     */
    aiTurn() {
        let suggestedSquareIsAvailable = false;
        let $suggestedSquare;
        let suggestedSquareNo;

        if (this.moves >= 2 && this.aiRandomness) {
            suggestedSquareNo = this.getBestSquare();

            $suggestedSquare = (suggestedSquareNo != -1) ? $(this.$square[suggestedSquareNo]) : '';
            
            if ($suggestedSquare) {
                suggestedSquareIsAvailable = !($suggestedSquare.hasClass("player")) && !($suggestedSquare.hasClass("ai"));
            }
        }        
        
        while (true) {
            if (suggestedSquareIsAvailable) {
                $suggestedSquare.addClass("ai").text(this.aiLetter);

                this.$game.removeClass("locked");
                this.$messages.children().addClass("hidden");

                this.aiPrevSquareNo = suggestedSquareNo;

                return suggestedSquareNo;
            }
            else {
                let choice = (this.moves == 0) ? 4 : Math.floor(Math.random() * 10); // 0 to 9
    
                if (choice == 9) {
                    choice = 8;
                }
        
                const $chosenSquare = $(this.$square[choice]);
                const squareIsAvailable = !($chosenSquare.hasClass("player")) && !($chosenSquare.hasClass("ai"));
                const squareNo = this.$square.index($chosenSquare);
        
                if (squareIsAvailable) {
                    $chosenSquare.addClass("ai").text(this.aiLetter);
                    
                    this.$game.removeClass("locked");
                    this.$messages.children().addClass("hidden");

                    this.aiPrevSquareNo = squareNo;

                    return squareNo;
                }
            }
        }
    }
    
    /**
     * An O(1) function to check if the player or computer has won the game.
     * 
     * @param squareNo integer of square clicked by player or the computer.
     * @param clickerClass who clicked the square (player / ai).
     * @returns true/false for the win conditions.
     */
    checkForWin(squareNo, clickerClass) {
        const $cell = $(this.$square[squareNo]);
        
        const $colSquareOne = (squareNo >= 6) ? $(this.$square[squareNo-6]) : 
            ((squareNo >= 3) ? $(this.$square[squareNo-3]) : $(this.$square[squareNo+3]));
        
        const $colSquareTwo = (squareNo >= 6) ? $(this.$square[squareNo-3]) : 
            ((squareNo >= 3) ? $(this.$square[squareNo+3]) : $(this.$square[squareNo+6]));
        
        const $rowSquareOne = (squareNo % 3 == 1) ? $(this.$square[squareNo-1]) : 
            ((squareNo % 3 == 2) ? $(this.$square[squareNo-2]) : $(this.$square[squareNo+1]));
    
        const $rowSquareTwo = (squareNo % 3 == 1) ? $(this.$square[squareNo+1]) : 
            ((squareNo % 3 == 2) ? $(this.$square[squareNo-1]) : $(this.$square[squareNo+2]));
    
        const row = $rowSquareOne.hasClass(clickerClass) && $rowSquareTwo.hasClass(clickerClass);
        const col = $colSquareOne.hasClass(clickerClass) && $colSquareTwo.hasClass(clickerClass);
        
        const $centreSquare = $(this.$square[4]);
        const diagOne = $(this.$square[0]).hasClass(clickerClass) && 
            $centreSquare.hasClass(clickerClass) && $(this.$square[8]).hasClass(clickerClass);
        const diagTwo = $(this.$square[2]).hasClass(clickerClass) && 
            $centreSquare.hasClass(clickerClass) && $(this.$square[6]).hasClass(clickerClass);
    
        return diagOne || diagTwo || ($cell.hasClass(clickerClass) && (row || col));
    }
    
    
    /**
     * A function to get the best square for the computer to pick. Will try to find the 
     * best defensive square first (if required), then the best winning square (if available), 
     * then the next best square.
     * 
     * Note: this logic is not perfect (TODO check it all)
     * 
     * @returns square number
     */
    getBestSquare() {
        let $colSquareOne = (this.playerPrevSquareNo >= 3) ? $(this.$square[this.playerPrevSquareNo-3]) : 
            $(this.$square[this.playerPrevSquareNo+3]);
        
        let $colSquareTwo = (this.playerPrevSquareNo >= 6) ? $(this.$square[this.playerPrevSquareNo-6]) : 
            ((this.playerPrevSquareNo >= 3) ? 
                $(this.$square[this.playerPrevSquareNo+3]) : $(this.$square[this.playerPrevSquareNo+6]));
        
        let $rowSquareOne = (this.playerPrevSquareNo % 3 == 2) ? $(this.$square[this.playerPrevSquareNo-1]) : 
           $(this.$square[this.playerPrevSquareNo+1]);
    
        let $rowSquareTwo = (this.playerPrevSquareNo % 3 == 2) ? $(this.$square[this.playerPrevSquareNo-2]) : 
            ((this.playerPrevSquareNo % 3 == 1) ? 
                $(this.$square[this.playerPrevSquareNo-1]) : $(this.$square[this.playerPrevSquareNo+2]));
    
        const row = ($rowSquareOne.hasClass("player") && !($rowSquareTwo.hasClass("ai"))) || 
            ($rowSquareTwo.hasClass("player") && !($rowSquareOne.hasClass("ai")));
        const col = ($colSquareOne.hasClass("player") && !($colSquareTwo.hasClass("ai"))) || 
            ($colSquareTwo.hasClass("player") && !($colSquareOne.hasClass("ai")));

        let squareToClick;
        
        // Return best defensive square (not perfect, doesn't account for diagonals)
        if (row || col) {
            if (row) {
                squareToClick = $rowSquareOne.hasClass("player") ? this.$square.index($rowSquareTwo) : 
                    this.$square.index($rowSquareOne);
            }
            else {
                squareToClick = $colSquareOne.hasClass("player") ? this.$square.index($colSquareTwo) : 
                    this.$square.index($colSquareOne);
            }

            return squareToClick;
        }
        // Return best square (not perfect, doesn't account for diagonals)
        else {
            const gridRows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

            // Check for winning square - TODO move to other loop
            for (let i = 0; i < gridRows.length; i++) {
                for (let j = 0; j < gridRows[i].length; j++) {
                    if ($(this.$square[gridRows[i][j]]).hasClass("ai")) {
                        let $squareToCheck = (j == 2) ? $(this.$square[gridRows[i][0]]) : 
                            $(this.$square[gridRows[i][j+1]]);
                        let $otherSquare = (j == 0) ? $(this.$square[gridRows[i][2]]) : 
                            $(this.$square[gridRows[i][j-1]]);

                        let stcIsAISquare = $squareToCheck.hasClass("ai");
                        let osIsEmpty = !($otherSquare.hasClass("player")) && !($otherSquare.hasClass("ai"));

                        if (stcIsAISquare && osIsEmpty) {
                            return (j == 0) ? gridRows[i][2] : gridRows[i][j-1];
                        }
                        else {
                            $squareToCheck = (i == 2) ? $(this.$square[gridRows[0][j]]) : 
                                $(this.$square[gridRows[i+1][j]]);
                            $otherSquare = (i == 0) ? $(this.$square[gridRows[2][j]]) : 
                                $(this.$square[gridRows[i-1][j]]);
    
                            stcIsAISquare = $squareToCheck.hasClass("ai");
                            osIsEmpty = !($otherSquare.hasClass("player")) && !($otherSquare.hasClass("ai"));
    
                            if (stcIsAISquare && osIsEmpty) {
                                return (i == 0) ? gridRows[2][j] : gridRows[i-1][j];
                            }
                        }
                    }
                }
            }

            // Check for next best square
            for (let i = 0; i < gridRows.length; i++) {
                for (let j = 0; j < gridRows[i].length; j++) {
                    if ($(this.$square[gridRows[i][j]]).hasClass("ai")) {
                        // Check rows first
                        let num = (j < 2) ? gridRows[i][j+1] : gridRows[i][0];
                        let otherSquareNum = (j > 0) ? gridRows[i][j-1] : gridRows[i][2];
                        
                        let $potentialSquare = $(this.$square[num]);
                        let potentialSquareNotTaken = !($potentialSquare.hasClass("ai")) && 
                            !($potentialSquare.hasClass("player"));

                        let $otherSquare = $(this.$square[otherSquareNum]);
                        let otherSquareNotTaken = !($otherSquare.hasClass("ai")) && 
                            !($otherSquare.hasClass("player"));

                        if (potentialSquareNotTaken && otherSquareNotTaken) {
                            return num;
                        }
                        else {
                            // Check columns next
                            num = (i < 2) ? gridRows[i+1][j] : gridRows[0][j];
                            otherSquareNum = (i > 0) ? gridRows[i-1][j] : gridRows[2][j];
                            
                            $potentialSquare = $(this.$square[num]);
                            potentialSquareNotTaken = !($potentialSquare.hasClass("ai")) && 
                                !($potentialSquare.hasClass("player"));

                            $otherSquare = $(this.$square[otherSquareNum]);
                            otherSquareNotTaken = !($otherSquare.hasClass("ai")) && 
                                !($otherSquare.hasClass("player"));

                            if (potentialSquareNotTaken && otherSquareNotTaken) {
                                return num;
                            }
                        }
                    }
                }
            }
            
            return -1;
        }
    }
}

$(document).ready(() => {
    let game = new Game();
});