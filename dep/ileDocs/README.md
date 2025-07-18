# ILEDocs Page Builder

This project builds a static pages from ILEDocs data. The pages can be static HTML pages or
Markdown pages for usage with [GitHub Pages][2].


## Build Application

First as with every Node.js application the dependencies must be installed with

    npm install

After having the dependencies installed the application can be built.

    npm run build


## Start Application

The `server.ts` script is the entry point of the application. The application
can also be started with `npm start`.

The project configuration file can be passed as a parameter to `npm start`:

    npm start project-config-myapp.json

If no secton config file is passed the application will look at the configuration 
attribute `config` for the project configuration file name.

By default the output will be placed into the folder `pages` if not configured
otherwise.


## Project File

The project file defines what will be parsed and how/where the output will be generated.

- project : project name
- title : title used in templates
- iledocs.url : URL to the ILEDocs web service 
- output.path : path to the output directory   
- output.suffix : suffix of the rendered pages   
- templates.path : path to the templates directory
- overview : generated kind of pages (index, index_json, page)
- section : section configuration
- source : path to the source


## ILEDocs Data Source

_http_ and _file_ are supported protocols for getting the ILEDocs data. File paths can be
relative or absolute.


## Pages

The project can build one or multiple pages from one ILEDocs data source. The suffix of the 
generated pages can be configured via the configuration entry `output.suffix`.

### Default Page

Each configured section will be rendered in one page. By default the template 
`<section.config.id>-page.ejs` will be used for rendering the page. If this template does not 
exist the application will fall back to the template `page/page.ejs`.

The template context for the template is the section model object, see `models/Section.ts`.

### Index HTML Page

If there is an `index.ejs` file available and the _overview_ configuration attribute contains
the value "index" the application will build an index page. The template context for this template
is an array of section model object, see `models/Section.ts`.

Note: The index page will _not_ be built if there is only a single section (even if there is an
      index.ejs template file).

### Index JSON File

If there is an `index.json.ejs` template file available and the _overview_ configuration attribute 
contains the value "index_json" the application will build an index json file. The template context
for this template is an array of section model object, see `models/Section.ts`.

Note: The index page will _not_ be built if there is only a single section (even if there is an
      index.ejs template file).

### Jekyll Config

If the template `_config.ejs` exist the application will create a Jekyll config file `_config.yml`.
The template context for this template is an array of section model object, see `models/Section.ts`.


## Section

A section may be one ILEDocs module or only part of the module.

Each page may have a block of text at the head of the page. If the text should be the description
from the ILEDocs module then set `descriptionAsHeader` to `true` in the section config.


## Section Config

The file `project-config.json` controls in which section the ILEDocs data will be splitted and what
symbol goes into which section.

Symbols can either be directly assigned to a section by adding its name to the _symbols_ array of a
section or by using the _startswith_ attribute. _startswith_ checks if the a symbol starts with the
given expression. A symbol can be assigned to more than one section.

If a symbol is not assigned to any section at all it can be assigned to a default section. The 
default section is identified by the attribute _default_ set to _true_.

For a list of available attributes see `models/SectionConfig.ts`.


## Logging

This application uses [winston][4] for logging. The start and end of the applications exectuion will
be logged. The log path and level is set via the configuration entries _log.path_ and _log.level_.

In _development_ mode the log output will be written to the log file _and_ the console.


## Configuration

The [config][5] package is used for configuring the application.

Configuration entry | Environment variable | &nbsp;                         
--------------------|----------------------|---------------------------------
log.path            | LOG_PATH             | path to the log directory      
log.level           | LOG_LEVEL            | winston log level              


## Debug

This project uses the [debug][3] package. The following debug ids are used.

- iledocs:application : Main Application
- iledocs:index_html : Index Page Builder
- iledocs:index_json : Index JSON Builder
- iledocs:iledocs_provider : ILEDocs Data Provider
- iledocs:iledocs_stream : ILEDocs Symbol Stream
- iledocs:jekyll_config : Jekyll Config Builder
- iledocs:page : Page Builder
- iledocs:section_builder : Section Builder (Symbol Aggregator)
- iledocs:sectionheader : Section Header Injector


## Requirements

This project was developed and tested with Node.js version v14.17.5.

[1]: https://jekyllrb.com/
[2]: https://pages.github.com/
[3]: https://github.com/visionmedia/debug#readme
[4]: https://github.com/winstonjs/winston#readme
[5]: https://github.com/lorenwest/node-config