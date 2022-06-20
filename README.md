# Grapher

<img width="1231" alt="image" src="https://user-images.githubusercontent.com/19304/173329214-89a6d0c7-eeeb-44b3-a324-eb4e8a626484.png">

This is an SVG-based interactive graph dataset editor that allows you to manually lay out nodes and edges but at the same time produce a clean graph-like JSON that can be consumed easily with libraries like Cytoscape JS. You can add arbitrary custom data fields at nodes and edges. The code is declarative and minimal enough that it can be tweaked easily to give your users an Interactive diagram as well.

## TODO

- Attaching/Detaching edges via control handles
- Dropping one node on another to create it as a child

Alpha:
- Test/fix dragging with zoom/pan enabled, or nodes with notes value
- Better path calculation for edges
- Edge label side ("side" attribute on `<textpath>` on non-Firefox browsers
- Tag filter should work with both kind of tags: `normaltag` and grouped tags like `org:xyz`
- Performance testing (1000 nodes?)

Beta:
- Discussion widgets tied to a location (eg: markup.io)
    - User authentication? Consider allowing anonymous comments. Can we require GitHub login?
- Badges on nodes
    - SVG badges
    - Workaround for unicode emojis work in badge text in Firefox
- (Rethink) When printed, show QR codes for nodes' links