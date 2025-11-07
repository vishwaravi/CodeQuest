// Supported programming languages for battles

export const LANGUAGES = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  C: 'c',
  CSHARP: 'csharp',
  GO: 'go',
  RUST: 'rust',
  TYPESCRIPT: 'typescript',
  PHP: 'php',
};

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
  { value: 'csharp', label: 'C#', icon: '💜' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
];

// Monaco Editor language mapping
export const MONACO_LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  typescript: 'typescript',
  go: 'go',
  rust: 'rust',
  php: 'php',
};

// Default starter code templates
export const STARTER_CODE = {
  javascript: `/**
 * @param {any} input
 * @return {any}
 */
function solution(input) {
    // Write your code here
    
    return result;
}`,

  python: `def solution(input):
    """
    Args:
        input: The input parameter
    Returns:
        The result
    """
    # Write your code here
    
    return result`,

  java: `class Solution {
    /**
     * @param input The input parameter
     * @return The result
     */
    public static Object solution(Object input) {
        // Write your code here
        
        return result;
    }
}`,

  cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    // Write your code here
    auto solution(auto input) {
        
        return result;
    }
};`,

  c: `#include <stdio.h>
#include <stdlib.h>

// Write your code here
void* solution(void* input) {
    
    return result;
}`,

  csharp: `using System;

public class Solution {
    /// <summary>
    /// Write your code here
    /// </summary>
    public static object SolutionMethod(object input) {
        
        return result;
    }
}`,

  typescript: `/**
 * @param {any} input
 * @returns {any}
 */
function solution(input: any): any {
    // Write your code here
    
    return result;
}`,

  go: `package main

import "fmt"

// Write your code here
func solution(input interface{}) interface{} {
    
    return result
}`,

  rust: `fn solution(input: &str) -> String {
    // Write your code here
    
    result
}`,

  php: `<?php

/**
 * @param mixed $input
 * @return mixed
 */
function solution($input) {
    // Write your code here
    
    return $result;
}`,
};

// Monaco Editor theme configurations
export const EDITOR_THEMES = {
  DARK: 'vs-dark',
  LIGHT: 'vs-light',
  HIGH_CONTRAST: 'hc-black',
};

// Monaco Editor options
export const DEFAULT_EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  quickSuggestions: true,
  renderWhitespace: 'selection',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 10, bottom: 10 },
};

// Code formatting options for Prettier
export const PRETTIER_OPTIONS = {
  javascript: {
    parser: 'babel',
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
  },
  typescript: {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
  },
  css: {
    parser: 'css',
    tabWidth: 2,
    printWidth: 80,
  },
  html: {
    parser: 'html',
    tabWidth: 2,
    printWidth: 80,
  },
  json: {
    parser: 'json',
    tabWidth: 2,
    printWidth: 80,
  },
};

export default {
  LANGUAGES,
  LANGUAGE_OPTIONS,
  MONACO_LANGUAGE_MAP,
  STARTER_CODE,
  EDITOR_THEMES,
  DEFAULT_EDITOR_OPTIONS,
  PRETTIER_OPTIONS,
};
