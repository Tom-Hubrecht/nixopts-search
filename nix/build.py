import json
import sys
from concurrent.futures import ThreadPoolExecutor
from xml.etree.ElementTree import Comment, ElementTree, ProcessingInstruction

from markdown import Extension, Markdown

# SPDX-SnippetBegin
# SPDX-License-Identifier: MIT
# SPDX-SnippetCopyrightText: 2023 Kostiantyn <kostyachum@gmail.com>


def _serialize_plain_text(write, elem):
    tag = elem.tag
    text = elem.text
    if tag is Comment:
        pass
    elif tag is ProcessingInstruction:
        pass
    elif tag is None:
        if text:
            write(text)
        for e in elem:
            _serialize_plain_text(write, e)
    else:
        if text:
            if tag.lower() not in ["script", "style"]:
                write(text)
        for e in elem:
            _serialize_plain_text(write, e)

    if elem.tail:
        write(elem.tail)


def _write_plain_text(root):
    assert root is not None
    data = []
    write = data.append
    _serialize_plain_text(write, root)
    return "".join(data)


def to_plain_text(element):
    return _write_plain_text(ElementTree(element).getroot())


class PlainTextExtension(Extension):
    def extendMarkdown(self, md):
        md.serializer = to_plain_text
        md.stripTopLevelTags = False

        # NOTE: Extention register actually runs before the format
        # is set and it ends up rewriting serializer that we have just changed
        md.set_output_format = lambda x: x  # type: ignore


# SPDX-SnippetEnd


def replace(option):
    desc = option["description"]

    option["descriptionHTML"] = Markdown().convert(desc)
    option["description"] = Markdown(extensions=[PlainTextExtension()]).convert(desc)

    return option


if __name__ == "__main__":
    path = sys.argv[1]
    out = sys.argv[2]

    with open(path) as fp:
        data = json.load(fp)

    # Replace all file paths in descriptionHTML
    with ThreadPoolExecutor() as executor:
        options = executor.map(replace, data)

    with open(out, "w") as fp:
        json.dump([*options], fp)
