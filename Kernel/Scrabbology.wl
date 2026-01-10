Needs["GeneralUtilities`" -> "GU`"];

Unprotect["Scrabbology`*", "Scrabbology`*`*"];
ClearAll["Scrabbology`*", "Scrabbology`*`*"];

BeginPackage["Scrabbology`"];

(* Declare public symbols (exported from the package). *) 
Get["Scrabbology`PublicSymbols`"];

(* Declare package symbols (not exported from the package, but can be used in any file). *)
Get["Scrabbology`PackageScope`"];

Map[
	Get,
	{
		"Scrabbology`ScrabbleHelper`",
		"Scrabbology`ScrabbleBoard`",
		"Scrabbology`PriorVersions`",
		"Scrabbology`Scrabblegorithm`",
		"Scrabbology`APIFunctions`"
	}
];
	

EndPackage[]

(*
Load from Notebook with:
SetDirectory[NotebookDirectory[]];
PacletDirectoryLoad[Directory[]];
Get["Scrabbology`"]
*)

(*https://www.reddit.com/r/scrabble/comments/my5tie/the_419_words_erased_from_csw/*)