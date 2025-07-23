type Declaration = {
  name: string;
  url: string;
};

type Option = {
  declarations: Declaration[];
  default?: string;
  description: string;
  descriptionHTML: string;
  example?: string;
  readOnly: boolean;
  title: string;
  type: string;
};

type NavbarLink = {
  name: string;
  href: string;
};

type Module = {
  title: string;
  path: string;
};

type Meta = {
  modules: { [propName: string]: Module };
  defaultSet: string;
  links: NavbarLink[];
};

type SearchStore = {
  limit: number;
  query: string;
  selectedOption: Option | null;
  titleSearch: boolean;
  descrSearch: boolean;
};
