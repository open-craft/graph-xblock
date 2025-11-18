"""Graph XBlock to help plot graph for mathematical equation in the course."""

from importlib.resources import files
import json

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Boolean, String, Scope
from xblock.utils.studio_editable import StudioEditableXBlockMixin
from xblock.validation import ValidationMessage
from openedx.core.djangoapps.site_configuration import helpers as configuration_helpers


def line_style_choice():
    """Choices for the line style in graph."""
    return [
        {"display_name": "Solid", "value": "Desmos.Styles.SOLIID"},
        {"display_name": "Dashed", "value": "Desmos.Styles.DASHED"},
        {"display_name": "Dotted", "value": "Desmos.Styles.DOTTED"},
    ]


class GraphXBlock(StudioEditableXBlockMixin, XBlock):
    """
    Graph XBlock is used to plot graphs for the students.
    """

    display_name = String(
        display_name="Display Name",
        default="Graph XBlock",
        scope=Scope.settings,
        help="Name of the XBlock in Studio",
    )

    api_key = String(
        display_name="API Key",
        default="",
        scope=Scope.content,
        help="Desmos API key to load the graph calculator",
    )

    seed_equation = String(
        display_name="Seed Equation",
        default="",
        help="If there should be some graph already shown, you can add the \
            equation here",
        scope=Scope.content,
    )

    line_style = String(
        display_name="Line Style",
        help="The style of lines to show on graph",
        default="",
        values=line_style_choice,
        scope=Scope.content,
    )

    xaxis_label = String(
        display_name="X AXIS LABEL",
        help="The label for X Axis",
        default="",
        scope=Scope.content,
    )

    yaxis_label = String(
        display_name="Y AXIS LABEL",
        help="The label for Y Axis",
        default="",
        scope=Scope.content,
    )

    hide_expression = Boolean(
        display_name="Hide Expression",
        help="Setting this option to true will make the graph visible but will \
      hide the expression",
        default=False,
        scope=Scope.content,
    )

    save_state_allowed = Boolean(
        display_name="Save State",
        help="Enabling this will allow the user to save the state of the graph",
        default=False,
        scope=Scope.content,
    )

    state = String(
        display_name="State for the user",
        help="Stores state of the user",
        default="",
        scope=Scope.user_state,
    )

    editable_fields = (
        "display_name",
        "api_key",
        "seed_equation",
        "line_style",
        "xaxis_label",
        "yaxis_label",
        "hide_expression",
        "save_state_allowed",
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        return files(__package__).joinpath(path).read_text(encoding="utf-8")

    def student_view(self, context=None):
        """
        The primary view of the GraphXBlock, shown to students
        when viewing courses.
        """
        desmos_api = configuration_helpers.get_value("DESMOS_API_KEY", None)
        desmos_url = configuration_helpers.get_value(
            "DESMOS_URL", "https://www.desmos.com/api/v1.9/calculator.js"
        )
        if self.api_key:
            desmos_api = self.api_key
        desmos_cdn_url = f"{desmos_url}?apiKey={desmos_api}"
        html = self.resource_string("static/html/graphxblock.html")
        frag = Fragment(html.format(self=self, desmos_cdn_url=desmos_cdn_url))
        frag.add_css(self.resource_string("static/css/graphxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/graphxblock.js"))
        frag.initialize_js(
            "GraphXBlock",
            {
                "default_expression": self.seed_equation,
                "line_style": self.line_style,
                "x_axis_lable": self.xaxis_label,
                "y_axis_lable": self.yaxis_label,
                "hide_expression": self.hide_expression,
                "save_state_allowed": self.save_state_allowed,
                "state": self.state,
            },
        )
        return frag

    def validate_field_data(self, validation, data):
        desmos_api = configuration_helpers.get_value("DESMOS_API_KEY", None)
        if len(data.api_key.strip()) == 0 and desmos_api is None:
            return validation.add(
                ValidationMessage(
                    ValidationMessage.ERROR,
                    "Please add an API Key in the site configuration or to the XBlock",
                )
            )

    @XBlock.json_handler
    def save_state(self, data, suffix=""):
        self.state = json.dumps(data)
        return {"status": "success"}

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            (
                "GraphXBlock",
                """<graphxblock/>
             """,
            ),
            (
                "Multiple GraphXBlock",
                """<vertical_demo>
                <graphxblock/>
                <graphxblock/>
                <graphxblock/>
                </vertical_demo>
             """,
            ),
        ]
