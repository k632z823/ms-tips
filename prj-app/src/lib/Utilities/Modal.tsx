import { Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
    header: string;
    body: JSX.Element;
    denyButton: JSX.Element;
    confirmButton: JSX.Element;
    onClose: () => void;
}

const Modal: Component<ModalProps> = (props) => {
    const { header, body, denyButton, confirmButton, onClose } = props;

    // close the modal by changing the show signal of the modal to false when click outside of modal
    const handleOverlayClick = (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            <Portal>
                <div 
                    class='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-[999]'
                    onclick={handleOverlayClick}
                >
                    <div class='flex justify-center'>
                        <div class='w-4/5 bg-dialog-bg-gray'>
                            <div class='border border-border-gray rounded-md'>
                                <div class='flex justify-center pt-5 font-semibold'>
                                    {header}
                                </div>
                                <div class='flex justify-center pt-1 pb-5 px-5 text-table-header-gray text-sm font-medium text-center'>
                                    {body}
                                </div>
                                <div class='px-5'>
                                    <div class='flex justify-center pb-2 text-sm'>
                                        {confirmButton}                                     
                                    </div>
                                    <div class='flex justify-center pb-5 text-sm'>
                                        {denyButton}
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