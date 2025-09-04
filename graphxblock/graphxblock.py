"""Graph XBlock to help plot graph for mathematical equation in the course."""

from importlib.resources import files

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import String, Scope
from xblock.utils.studio_editable import StudioEditableXBlockMixin


class GraphXBlock(StudioEditableXBlockMixin, XBlock):
    """
    Graph XBlock is used to plot grahs for the student,
    """
    api_key = String(
        default="Some API Key",
        scope=Scope.content,
        help="Desmos API key to load the graph calculator",
    )

    seed_equation = String(
        default="",
        help="If there should be some graph already shown, you can add the \
            equation here",
        scope=Scope.content,
    )

    editable_fields = ("display_name", "api_key", "seed_equation")

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        return files(__package__).joinpath(path).read_text(encoding="utf-8")

    def student_view(self, context=None):
        """
        The primary view of the GraphXBlock, shown to students
        when viewing courses.
        """
        desmos_cdn_url = f"https://www.desmos.com/api/v1.9/calculator.js?apiKey={self.api_key}"
        html = self.resource_string("static/html/graphxblock.html")
        frag = Fragment(html.format(self=self, desmos_cdn_url=desmos_cdn_url))
        frag.add_css(self.resource_string("static/css/graphxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/graphxblock.js"))
        frag.initialize_js('GraphXBlock', {
            "default_expression": self.seed_equation, 
        })
        return frag

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("GraphXBlock",
             """<graphxblock/>
             """),
            ("Multiple GraphXBlock",
             """<vertical_demo>
                <graphxblock/>
                <graphxblock/>
                <graphxblock/>
                </vertical_demo>
             """),
        ]
