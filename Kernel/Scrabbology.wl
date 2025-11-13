SetDirectory[ParentDirectory @ DirectoryName @ $InputFileName];

Get[#]& /@ {
	"Scrabbology`ScrabbleHelper`",
	"Scrabbology`Scrabblegorithm`",
	"Scrabbology`ScrabbleBoard`"
};