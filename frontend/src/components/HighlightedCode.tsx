import { Highlight, themes } from 'prism-react-renderer';

// 저장된 codeLanguage 값(GitHub 코드펜스와 호환되는 표기)을
// Prism 문법 키로 바꿔줘야 하는 몇 가지 예외만 매핑한다.
const PRISM_ALIAS: Record<string, string> = {
  html: 'markup',
};

interface Props {
  code: string;
  language?: string;
  tagLabel?: string;
}

// 코드/실행 결과를 감싸는 dark 프레임 + (코드인 경우) 문법 강조.
export default function HighlightedCode({ code, language, tagLabel }: Props) {
  // codeLanguage가 빈 문자열("일반 텍스트" 선택)일 수 있어 ??가 아니라 ||로 폴백해야 한다.
  const prismLanguage = PRISM_ALIAS[language || ''] || language || 'plaintext';

  return (
    <div className="code-frame">
      <span className="code-frame__tag">{tagLabel || language || 'code'}</span>
      <Highlight code={code.trim()} language={prismLanguage} theme={themes.vsDark}>
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <pre className={`code-block ${className}`}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
