import { Handler } from "plainweb";
import { DocumentLogo } from "~/app/components/document-logo";
import { GithubLogo } from "~/app/components/github-logo";
import RootLayout from "~/app/root";

export const GET: Handler = async () => {
  return (
    <RootLayout>
      <div class="max-w-4xl mx-auto mt-32 text-center">
        <h1 class="leading-5 font-bold text-8xl text-gray-700">Let's go 🎻</h1>
      </div>
      <div class="max-w-4xl mx-auto mt-32 text-gray-700 text-xl">
        <ul class="flex whitespace-nowrap space-x-8 justify-center">
          <li>
            <a
              aria-label="Read the docs"
              href="https://www.plainweb.dev/docs/getting-started"
              class="flex items-center"
            >
              <DocumentLogo />
              <span>Docs</span>
            </a>
          </li>
          <li>
            <a
              aria-label="Check the project out on GitHub"
              href="https://www.github.com/joseferben/plainweb"
              class="flex items-center"
            >
              <GithubLogo />
              <span>Github</span>
            </a>
          </li>
        </ul>
      </div>
    </RootLayout>
  );
};
