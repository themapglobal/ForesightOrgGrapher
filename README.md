# Grapher

<img width="1231" alt="image" src="https://user-images.githubusercontent.com/19304/173329214-89a6d0c7-eeeb-44b3-a324-eb4e8a626484.png">

This is an SVG-based interactive graph dataset editor that allows you to manually lay out nodes and edges but at the same time produce a clean graph-like JSON that can be consumed easily with libraries like Cytoscape JS. You can add arbitrary custom data fields at nodes and edges. The code is declarative and minimal enough that it can be tweaked easily to give your users an Interactive diagram as well.

## TODO

- Attaching/Detaching edges via control handles
- Dropping one node on another to create it as a child

Alpha:
- Panning and Zooming
- Graph operations, including Compound node
- Better path calculation for edges
- Edge label side on non-Firefox browsers
- Apply existing styling/aesthetics 
- Free-form tags input as custom field: https://jifalops.github.io/tags-input/components/tags-input/demo/
- Hyperlink field for nodes/edges
- Plan for up to 1000 nodes

Beta:
- Query tags as TableView and highlight results
- Discussion widgets tied to a location (eg: markup.io)
    - User authentication? Consider allowing anonymous comments. Can we require GitHub login?
- Badges on nodes
- (Rethink) When printed, show QR codes for nodes
- Performance testing
- make unicode emojis work in badge text




