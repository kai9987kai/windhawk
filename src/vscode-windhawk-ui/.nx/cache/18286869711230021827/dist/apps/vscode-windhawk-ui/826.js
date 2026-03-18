"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[826],{

/***/ 34826
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   conf: () => (/* binding */ conf),
/* harmony export */   language: () => (/* binding */ language)
/* harmony export */ });
/* harmony import */ var _editor_browser_coreCommands_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58456);
/* harmony import */ var _editor_browser_widget_codeEditor_codeEditorWidget_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(85352);
/* harmony import */ var _editor_browser_widget_diffEditor_diffEditor_contribution_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(83350);
/* harmony import */ var _editor_contrib_anchorSelect_browser_anchorSelect_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(64158);
/* harmony import */ var _editor_contrib_bracketMatching_browser_bracketMatching_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(81324);
/* harmony import */ var _editor_contrib_caretOperations_browser_caretOperations_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(36407);
/* harmony import */ var _editor_contrib_caretOperations_browser_transpose_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(39138);
/* harmony import */ var _editor_contrib_clipboard_browser_clipboard_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(16622);
/* harmony import */ var _editor_contrib_codeAction_browser_codeActionContributions_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(10092);
/* harmony import */ var _editor_contrib_codelens_browser_codelensController_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(54609);
/* harmony import */ var _editor_contrib_colorPicker_browser_colorPickerContribution_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(89270);
/* harmony import */ var _editor_contrib_comment_browser_comment_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(21958);
/* harmony import */ var _editor_contrib_contextmenu_browser_contextmenu_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(94196);
/* harmony import */ var _editor_contrib_cursorUndo_browser_cursorUndo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(37928);
/* harmony import */ var _editor_contrib_dnd_browser_dnd_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(88671);
/* harmony import */ var _editor_contrib_dropOrPasteInto_browser_copyPasteContribution_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(10287);
/* harmony import */ var _editor_contrib_dropOrPasteInto_browser_dropIntoEditorContribution_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(13840);
/* harmony import */ var _editor_contrib_find_browser_findController_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(44533);
/* harmony import */ var _editor_contrib_folding_browser_folding_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(76342);
/* harmony import */ var _editor_contrib_fontZoom_browser_fontZoom_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(51228);
/* harmony import */ var _editor_contrib_format_browser_formatActions_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(39211);
/* harmony import */ var _editor_contrib_documentSymbols_browser_documentSymbols_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(65212);
/* harmony import */ var _editor_contrib_inlineCompletions_browser_inlineCompletions_contribution_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(6668);
/* harmony import */ var _editor_contrib_inlineProgress_browser_inlineProgress_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(30780);
/* harmony import */ var _editor_contrib_gotoSymbol_browser_goToCommands_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(25395);
/* harmony import */ var _editor_contrib_gotoSymbol_browser_link_goToDefinitionAtPosition_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(62576);
/* harmony import */ var _editor_contrib_gotoError_browser_gotoError_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(673);
/* harmony import */ var _editor_contrib_gpu_browser_gpuActions_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(853);
/* harmony import */ var _editor_contrib_hover_browser_hoverContribution_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(15500);
/* harmony import */ var _editor_contrib_indentation_browser_indentation_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(29471);
/* harmony import */ var _editor_contrib_inlayHints_browser_inlayHintsContribution_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(756);
/* harmony import */ var _editor_contrib_inPlaceReplace_browser_inPlaceReplace_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(27070);
/* harmony import */ var _editor_contrib_insertFinalNewLine_browser_insertFinalNewLine_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(96667);
/* harmony import */ var _editor_contrib_lineSelection_browser_lineSelection_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(2788);
/* harmony import */ var _editor_contrib_linesOperations_browser_linesOperations_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(82259);
/* harmony import */ var _editor_contrib_linkedEditing_browser_linkedEditing_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(28948);
/* harmony import */ var _editor_contrib_links_browser_links_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(34510);
/* harmony import */ var _editor_contrib_longLinesHelper_browser_longLinesHelper_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(13860);
/* harmony import */ var _editor_contrib_middleScroll_browser_middleScroll_contribution_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(41127);
/* harmony import */ var _editor_contrib_multicursor_browser_multicursor_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(27588);
/* harmony import */ var _editor_contrib_parameterHints_browser_parameterHints_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(24915);
/* harmony import */ var _editor_contrib_placeholderText_browser_placeholderText_contribution_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(97598);
/* harmony import */ var _editor_contrib_rename_browser_rename_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(3633);
/* harmony import */ var _editor_contrib_sectionHeaders_browser_sectionHeaders_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(82634);
/* harmony import */ var _editor_contrib_semanticTokens_browser_documentSemanticTokens_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(76117);
/* harmony import */ var _editor_contrib_semanticTokens_browser_viewportSemanticTokens_js__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(10506);
/* harmony import */ var _editor_contrib_smartSelect_browser_smartSelect_js__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(29653);
/* harmony import */ var _editor_contrib_snippet_browser_snippetController2_js__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(30252);
/* harmony import */ var _editor_contrib_stickyScroll_browser_stickyScrollContribution_js__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(16231);
/* harmony import */ var _editor_contrib_suggest_browser_suggestController_js__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(6049);
/* harmony import */ var _editor_contrib_suggest_browser_suggestInlineCompletions_js__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(46322);
/* harmony import */ var _editor_contrib_tokenization_browser_tokenization_js__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(6122);
/* harmony import */ var _editor_contrib_toggleTabFocusMode_browser_toggleTabFocusMode_js__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(98060);
/* harmony import */ var _editor_contrib_unicodeHighlighter_browser_unicodeHighlighter_js__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(90057);
/* harmony import */ var _editor_contrib_unusualLineTerminators_browser_unusualLineTerminators_js__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(80958);
/* harmony import */ var _editor_contrib_wordHighlighter_browser_wordHighlighter_js__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(29333);
/* harmony import */ var _editor_contrib_wordOperations_browser_wordOperations_js__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(8396);
/* harmony import */ var _editor_contrib_wordPartOperations_browser_wordPartOperations_js__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(72658);
/* harmony import */ var _editor_contrib_readOnlyMessage_browser_contribution_js__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(36895);
/* harmony import */ var _editor_contrib_diffEditorBreadcrumbs_browser_contribution_js__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(53548);
/* harmony import */ var _editor_contrib_floatingMenu_browser_floatingMenu_contribution_js__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(65372);
/* harmony import */ var _editor_common_standaloneStrings_js__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(85497);
/* harmony import */ var _editor_standalone_browser_iPadShowKeyboard_iPadShowKeyboard_js__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(974);
/* harmony import */ var _editor_standalone_browser_inspectTokens_inspectTokens_js__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(5476);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneHelpQuickAccess_js__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(92242);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneGotoLineQuickAccess_js__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(22530);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneGotoSymbolQuickAccess_js__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(89766);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneCommandsQuickAccess_js__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(96844);
/* harmony import */ var _editor_standalone_browser_referenceSearch_standaloneReferenceSearch_js__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(7829);
/* harmony import */ var _editor_standalone_browser_toggleHighContrast_toggleHighContrast_js__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(84006);
/* harmony import */ var _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(79453);










































































const conf = {
  comments: {
    lineComment: "#"
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  folding: {
    offSide: true
  },
  onEnterRules: [
    {
      beforeText: /:\s*$/,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_70__.languages.IndentAction.Indent
      }
    }
  ]
};
const language = {
  tokenPostfix: ".yaml",
  brackets: [
    { token: "delimiter.bracket", open: "{", close: "}" },
    { token: "delimiter.square", open: "[", close: "]" }
  ],
  keywords: ["true", "True", "TRUE", "false", "False", "FALSE", "null", "Null", "Null", "~"],
  numberInteger: /(?:0|[+-]?[0-9]+)/,
  numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:e[-+][1-9][0-9]*)?/,
  numberOctal: /0o[0-7]+/,
  numberHex: /0x[0-9a-fA-F]+/,
  numberInfinity: /[+-]?\.(?:inf|Inf|INF)/,
  numberNaN: /\.(?:nan|Nan|NAN)/,
  numberDate: /\d{4}-\d\d-\d\d([Tt ]\d\d:\d\d:\d\d(\.\d+)?(( ?[+-]\d\d?(:\d\d)?)|Z)?)?/,
  escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@comment" },
      // Directive
      [/%[^ ]+.*$/, "meta.directive"],
      // Document Markers
      [/---/, "operators.directivesEnd"],
      [/\.{3}/, "operators.documentEnd"],
      // Block Structure Indicators
      [/[-?:](?= )/, "operators"],
      { include: "@anchor" },
      { include: "@tagHandle" },
      { include: "@flowCollections" },
      { include: "@blockStyle" },
      // Numbers
      [/@numberInteger(?![ \t]*\S+)/, "number"],
      [/@numberFloat(?![ \t]*\S+)/, "number.float"],
      [/@numberOctal(?![ \t]*\S+)/, "number.octal"],
      [/@numberHex(?![ \t]*\S+)/, "number.hex"],
      [/@numberInfinity(?![ \t]*\S+)/, "number.infinity"],
      [/@numberNaN(?![ \t]*\S+)/, "number.nan"],
      [/@numberDate(?![ \t]*\S+)/, "number.date"],
      // Key:Value pair
      [/(".*?"|'.*?'|[^#'"]*?)([ \t]*)(:)( |$)/, ["type", "white", "operators", "white"]],
      { include: "@flowScalars" },
      // String nodes
      [
        /.+?(?=(\s+#|$))/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "string"
          }
        }
      ]
    ],
    // Flow Collection: Flow Mapping
    object: [
      { include: "@whitespace" },
      { include: "@comment" },
      // Flow Mapping termination
      [/\}/, "@brackets", "@pop"],
      // Flow Mapping delimiter
      [/,/, "delimiter.comma"],
      // Flow Mapping Key:Value delimiter
      [/:(?= )/, "operators"],
      // Flow Mapping Key:Value key
      [/(?:".*?"|'.*?'|[^,\{\[]+?)(?=: )/, "type"],
      // Start Flow Style
      { include: "@flowCollections" },
      { include: "@flowScalars" },
      // Scalar Data types
      { include: "@tagHandle" },
      { include: "@anchor" },
      { include: "@flowNumber" },
      // Other value (keyword or string)
      [
        /[^\},]+/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "string"
          }
        }
      ]
    ],
    // Flow Collection: Flow Sequence
    array: [
      { include: "@whitespace" },
      { include: "@comment" },
      // Flow Sequence termination
      [/\]/, "@brackets", "@pop"],
      // Flow Sequence delimiter
      [/,/, "delimiter.comma"],
      // Start Flow Style
      { include: "@flowCollections" },
      { include: "@flowScalars" },
      // Scalar Data types
      { include: "@tagHandle" },
      { include: "@anchor" },
      { include: "@flowNumber" },
      // Other value (keyword or string)
      [
        /[^\],]+/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "string"
          }
        }
      ]
    ],
    // First line of a Block Style
    multiString: [[/^( +).+$/, "string", "@multiStringContinued.$1"]],
    // Further lines of a Block Style
    //   Workaround for indentation detection
    multiStringContinued: [
      [
        /^( *).+$/,
        {
          cases: {
            "$1==$S2": "string",
            "@default": { token: "@rematch", next: "@popall" }
          }
        }
      ]
    ],
    whitespace: [[/[ \t\r\n]+/, "white"]],
    // Only line comments
    comment: [[/#.*$/, "comment"]],
    // Start Flow Collections
    flowCollections: [
      [/\[/, "@brackets", "@array"],
      [/\{/, "@brackets", "@object"]
    ],
    // Start Flow Scalars (quoted strings)
    flowScalars: [
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/'[^']*'/, "string"],
      [/"/, "string", "@doubleQuotedString"]
    ],
    doubleQuotedString: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"]
    ],
    // Start Block Scalar
    blockStyle: [[/[>|][0-9]*[+-]?$/, "operators", "@multiString"]],
    // Numbers in Flow Collections (terminate with ,]})
    flowNumber: [
      [/@numberInteger(?=[ \t]*[,\]\}])/, "number"],
      [/@numberFloat(?=[ \t]*[,\]\}])/, "number.float"],
      [/@numberOctal(?=[ \t]*[,\]\}])/, "number.octal"],
      [/@numberHex(?=[ \t]*[,\]\}])/, "number.hex"],
      [/@numberInfinity(?=[ \t]*[,\]\}])/, "number.infinity"],
      [/@numberNaN(?=[ \t]*[,\]\}])/, "number.nan"],
      [/@numberDate(?=[ \t]*[,\]\}])/, "number.date"]
    ],
    tagHandle: [[/\![^ ]*/, "tag"]],
    anchor: [[/[&*][^ ]+/, "namespace"]]
  }
};




/***/ }

}]);
//# sourceMappingURL=826.js.map