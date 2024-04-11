import { Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
    body: JSX.Element;
    deny: string;
    confirm: string;
    onDenyClick: () => void;
    onConfirmClick: () => void;
}

const Modal: Component<ModalProps> = (props) => {
    const { body, deny, confirm, onDenyClick, onConfirmClick } = props;
    
    return (
        <>
        <Portal>
            <div>
                {body}
                <div>
                    <button
                        onclick={() => onDenyClick()}
                    >
                        {deny}
                    </button>
                    <button
                        onclick={() => onConfirmClick()}
                    >
                        {confirm}
                    </button>
                </div>
            </div>
        </Portal>
        </>
    )

}

export default Modal;