import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default function IconToolTip({ text, children }) {
    return (
        <OverlayTrigger placement="top" delay={{ show: 350, hide: 400 }} overlay={(props) => renderTooltip(props, text)}>
            {children}
        </OverlayTrigger>
    )
}

const renderTooltip = (props, text) => (
    <Tooltip {...props}>
        {text}
    </Tooltip>
);