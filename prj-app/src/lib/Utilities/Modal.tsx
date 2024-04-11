import { Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
    header: string;
    body: JSX.Element;
    deny: string;
    confirm: string;
    onDenyClick: () => void;
    onConfirmClick: () => void;
}

const Modal: Component<ModalProps> = (props) => {
    const { header, body, deny, confirm, onDenyClick, onConfirmClick } = props;

    return (
        <>
            <Portal>
                <div class='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-[999]'>
                    <div class='flex justify-center'>
                        <div class='w-4/5 bg-input-gray'>
                            <div class='border border-border-gray rounded-md'>
                                <div class='flex justify-center pt-5 font-semibold'>
                                    {header}
                                </div>
                                <div class='flex justify-center pt-1 pb-5 px-5 text-content-gray text-sm text-center'>
                                    {body}
                                </div>
                                <div class='px-5'>
                                    <div class='flex justify-center pb-2 text-sm'>
                                        <button
                                            class='w-full p-1.5 text-center text-black font-medium rounded-md bg-white hover:bg-white/90'
                                            onclick={() => onConfirmClick()}
                                        >
                                            {confirm}
                                        </button>
                                    </div>
                                    <div class='flex justify-center pb-5 text-sm'>
                                        <button
                                            class='w-full p-1.5 text-center border border-border-gray hover:bg-border-gray rounded-md'
                                            onclick={() => onDenyClick()}
                                        >
                                            {deny}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        </>
    )

}

export default Modal;