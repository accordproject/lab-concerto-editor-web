import Editor, { Monaco } from '@monaco-editor/react';
import { debounce } from 'ts-debounce';

import useStore from '../store';

function ConcertoText() {
  const editorNamespace = useStore(state => state.editorNamespace);
  const ctoText = useStore(state => editorNamespace ? state.models[editorNamespace.namespace]?.text : '');
  const ctoModified = useStore(state => state.ctoModified);

  function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.register({ id: 'concerto' });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('concerto', {
      tokenizer: {
        root: [
          [/concept.*/, 'concept-token'],
          [/namespace.*/, 'namespace-token'],
          [/asset/, 'concept-token'],
          [/participant/, 'concept-token'],
          [/event/, 'concept-token'],
          [/transaction/, 'concept-token'],
          [/enum.*/, 'enum-token'],
          [/[@]diagram\(.*/, 'diagram-token'],
          [/String/, 'primitive-token'],
          [/Long/, 'primitive-token'],
          [/Double/, 'primitive-token'],
          [/DateTime/, 'primitive-token'],
          [/Boolean/, 'primitive-token'],
          [/Integer/, 'primitive-token'],
          [/optional/, 'optional-token'],
          [/-->/, 'relationship-token'],
        ],
      },
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme('concertoTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: 'concept-token', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'enum-token', foreground: 'ff0000', fontStyle: 'bold' },
        { token: 'diagram-token', foreground: 'aaaaaa' },
        { token: 'primitive-token', foreground: '000000', fontStyle: 'bold' },
        { token: 'relationship-token', foreground: '11ffdd', fontStyle: 'bold' },
        { token: 'optional-token', foreground: '000000', fontStyle: 'italic' },
        { token: 'namespace-token', foreground: 'ff00ff', fontStyle: 'bold' },
      ],
      colors: {
        'editor.foreground': '#000000',
      },
    });
  }

  const debouncedFunction = debounce((value: string | undefined) => {
    if (value) {
      ctoModified(value);
    }
  }, 500);

  function handleEditorChange(value: string | undefined) {
    void debouncedFunction(value);
  }

  return (
    <Editor
      height='80vh'
      defaultLanguage='concerto'
      theme='concertoTheme'
      value={ctoText}
      onChange={handleEditorChange}
      beforeMount={handleEditorWillMount}
    />
  );
}

export default ConcertoText;
