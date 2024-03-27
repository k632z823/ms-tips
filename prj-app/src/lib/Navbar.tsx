import { For, type Component, Show, createSignal, onCleanup } from "solid-js";
import { A } from "@solidjs/router";

import pfp from "../logos/cat_profile_pic.png";

function clickOutside(
	el: {
		contains: (arg0: any) => any;
	},
	accessor: () => {
		(): any;
		new (): any;
	},
) {
	const onClick = (e: { target: any }) =>
		!el.contains(e.target) && accessor()?.();

	document.body.addEventListener("click", onClick);

	onCleanup(() => {
		document.body.removeEventListener("click", onClick);
	});
}

// MOBILE
interface NavbarMobileProps {
	items: {
		group: "dropdown" | "profile";
		label: string;
		path: string;
		icon: string;
	}[];
}

const NavbarMobile: Component<NavbarMobileProps> = (
	props: NavbarMobileProps,
) => {
	const [isSelected, setIsSelected] = createSignal<boolean>(false);
	const [isOpen, setIsOpen] = createSignal<boolean>(false);

	return (
		<>
			<div
				id='profile'
				class='flex items-center gap-2'
				//@ts-ignore
				use:clickOutside={() => {
					setIsSelected(false);
				}}
			>
				<img
					id='avatarButton'
					class='w-10 h-10 rounded-full cursor-pointer'
					data-dropdown-toggle='userDropdown'
					data-dropdown-placement='bottom-start'
					src={pfp}
					onClick={() => {
						setIsSelected(!isSelected());
					}}
				></img>
				MUSTARD SEED
				<div
					id='profile-dropdown'
					class='absolute left-0 top-10 w-full p-2'
				>
					<div
						class={`bg-gray-100 flex flex-col mt-2 gap-2 mrounded-md min-w-max w-full overflow-hidden transition all ${
							isSelected() ? "max-h-96 p-2" : "max-h-0 p-0"
						}`}
					>
						<For each={props.items}>
							{(item) => (
								<Show when={item.group == "profile"}>
									<div class='flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md transition-all'>
										<img src={item.icon} />
										<A href={item.path}>{item.label}</A>
									</div>
								</Show>
							)}
						</For>
					</div>
				</div>
			</div>
			<div
				id='dropdown'
				//@ts-ignore
				use:clickOutside={() => {
					setIsOpen(false);
				}}
			>
				<svg
					id='dropdown-icon'
					onClick={() => {
						setIsOpen(!isOpen());
					}}
					class='cursor-pointer h-8 w-8 text-gray-700  p-1 rounded-lg tranistion-all'
					fill='currentColor'
					stroke-width='0'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 1024 1024'
					style='overflow: visible; color: currentcolor;'
				>
					<path d='M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z'></path>
				</svg>
				<div
					id='dropdown-items'
					class='absolute left-0 top-10 w-full p-2'
				>
					<div
						class={`bg-gray-100 flex flex-col mt-2 gap-2 mrounded-md min-w-max w-full overflow-hidden transition all ${
							isOpen() ? "max-h-96 p-2" : "max-h-0 p-0"
						}`}
					>
						<For each={props.items}>
							{(item) => (
								<Show when={item.group == "dropdown"}>
									<div class='flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md transition-all'>
										<img src={item.icon} />
										<a href={item.path}>{item.label}</a>
									</div>
								</Show>
							)}
						</For>
					</div>
				</div>
			</div>
		</>
	);
};

// MAIN PARENT COMPONENT
interface NavbarProps {
	items: {
		group: "dropdown" | "profile";
		label: string;
		path: string;
		icon: string;
	}[];
}

const Navbar: Component<NavbarProps> = (props: NavbarProps) => {
	//pulls one of each group names
	return (
		<nav>
			<div class='fixed sm:hidden flex w-full items-center justify-between px-4 py-2'>
				<NavbarMobile items={props.items} />
			</div>
		</nav>
	);
};

export default Navbar;
