interface File {
  fileName: string;
  [key: string]: unknown;
}

function sortAllFilenames(files: File[], filenamesSorted: string[]): File[] {
  return [
    ...filenamesSorted.map((filename) =>
      files.find(({ fileName }) => fileName === filename),
    ),
    ...(files.filter(({ fileName }) => !filenamesSorted.includes(fileName)) ||
      []),
  ].filter(Boolean) as File[];
}

export interface Framework {
  id: string;
  title: string;
  frameworkName: string; // 用于分组，这里可以是语言名
  frameworkNameId: string;
  isLatestStable: boolean;
  img: string;
  playgroundURL: string;
  documentationURL: string;
  filesSorter: (files: File[]) => File[];
  repositoryLink: string;
  mainPackageName: string;
  releaseDate: string;
}

export const frameworks: Framework[] = [
  {
    id: "java",
    title: "Java",
    frameworkName: "Java",
    frameworkNameId: "java",
    isLatestStable: true,
    img: "framework/java.svg",
    playgroundURL: "",
    documentationURL: "https://docs.oracle.com/en/java/",
    filesSorter(files) {
      return sortAllFilenames(files, ["Main.java"]);
    },
    repositoryLink: "https://github.com/openjdk",
    mainPackageName: "java",
    releaseDate: "1995-05-23",
  },
  {
    id: "go",
    title: "Go",
    frameworkName: "Go",
    frameworkNameId: "go",
    isLatestStable: true,
    img: "framework/go.svg",
    playgroundURL: "https://go.dev/play/",
    documentationURL: "https://go.dev/doc/",
    filesSorter(files) {
      return sortAllFilenames(files, ["main.go"]);
    },
    repositoryLink: "https://github.com/golang/go",
    mainPackageName: "go",
    releaseDate: "2009-11-10",
  },
  {
    id: "nodejs",
    title: "Node.js",
    frameworkName: "Node.js",
    frameworkNameId: "nodejs",
    isLatestStable: true,
    img: "framework/nodejs.svg",
    playgroundURL: "",
    documentationURL: "https://nodejs.org/en/docs/",
    filesSorter(files) {
      return sortAllFilenames(files, ["index.js", "package.json"]);
    },
    repositoryLink: "https://github.com/nodejs/node",
    mainPackageName: "node",
    releaseDate: "2009-05-27",
  },
  {
    id: "python",
    title: "Python",
    frameworkName: "Python",
    frameworkNameId: "python",
    isLatestStable: true,
    img: "framework/python.svg",
    playgroundURL: "",
    documentationURL: "https://docs.python.org/3/",
    filesSorter(files) {
      return sortAllFilenames(files, ["main.py"]);
    },
    repositoryLink: "https://github.com/python/cpython",
    mainPackageName: "python",
    releaseDate: "1991-02-20",
  },
  {
    id: "php",
    title: "PHP",
    frameworkName: "PHP",
    frameworkNameId: "php",
    isLatestStable: true,
    img: "framework/php.svg",
    playgroundURL: "https://3v4l.org/",
    documentationURL: "https://www.php.net/docs.php",
    filesSorter(files) {
      return sortAllFilenames(files, ["index.php"]);
    },
    repositoryLink: "https://github.com/php/php-src",
    mainPackageName: "php",
    releaseDate: "1995-06-08",
  },
];

export function matchFrameworkId(id: string): Framework | undefined {
  let framework = frameworks.find((f) => f.id === id);
  if (!framework) {
    const latestStable = getLatestStableFrameworkByFrameworkName(id);
    if (latestStable) {
      framework = latestStable;
    }
  }
  return framework;
}

export function getFrameworksByFrameworkName(
  frameworkNameId: string,
): Framework[] {
  return frameworks.filter(
    (framework) => framework.frameworkNameId === frameworkNameId,
  );
}

export function getLatestStableFrameworkByFrameworkName(
  frameworkNameId: string,
): Framework | undefined {
  return frameworks.find(
    (framework) =>
      framework.frameworkNameId === frameworkNameId && framework.isLatestStable,
  );
}

export function getFrameworkNameIds(): string[] {
  return [...new Set(frameworks.map((framework) => framework.frameworkNameId))];
}

export function getFrameworkNameInfo(frameworkNameId: string): {
  frameworkNameId: string;
  frameworks: Framework[];
  latestStable: Framework | undefined;
  allVersions: string[];
} {
  const familyFrameworks = getFrameworksByFrameworkName(frameworkNameId);
  const latestStable = getLatestStableFrameworkByFrameworkName(frameworkNameId);

  return {
    frameworkNameId,
    frameworks: familyFrameworks,
    latestStable,
    allVersions: familyFrameworks.map((f) => f.id),
  };
}
