import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import $ from "jquery";
import Gallery from "react-photo-gallery";
import Photo from "./Photo";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
	arrayMove ,
} from 'react-sortable-hoc';
import { convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';

function removeHtmlTagsFromString(string) {

	var text = draftToHtml(convertToRaw(string.getCurrentContent()));
	const regex = /(<([^>]+)>)/ig;
	return text.replace(regex, '');
}
const DragHandle = sortableHandle(() => <div className="showcase-style-handle-main"><div class="showcase-style-handle"></div></div>);

const GridItem = ({ data }) => {
	let menuItems = [];
	for (var i = 0; i < 4; i++) {
		menuItems.push(<div className="grid-order-image-count">
			{data[i] ? (
				<img src={data[i].src} />
			) : null}
		</div>);
	}
	return <div className="grid-order-image-count-main">{menuItems}</div>;
}
const SortableItem = sortableElement(({ field }) => {
	var value = field.data;
	return (
		<div className="reorder-list-item">
			<DragHandle />
			<div className="thumbnail">
				{value.ImagePreview && value.mediaTypes == "Image" ? (
					<img src={value.ImagePreview} />
				) : null}

				{value.ImagePreview && value.mediaTypes == "Grid" ? (

					<GridItem data={value.ImagePreview} />

				) : null}

				{value.mediaTypes == "Text" ? (
					<img src={process.env.PUBLIC_URL + "/assets/images/text.svg"}
						alt=""
					/>
				) : null}

				{value.ImagePreview && value.mediaTypes == "Video" ? (
					<img src={process.env.PUBLIC_URL + "/assets/images/video.svg"}
						alt=""
					/>
				) : null}
			</div>
			<div className="media-type">{value.mediaTypes}
				{value.mediaTypes == "Text" ? (
					// <div dangerouslySetInnerHTML={{ __html: someHtml }}></div>
					<span>{removeHtmlTagsFromString(value.inputValue)} </span>


				) : null}
				{value.mediaTypes == "Grid" ? (
					<span>{value.ImagePreview.length} (Image) </span>

				) : null}
			</div>
		</div>
	);
});
const SortableContainer = sortableContainer(({ children }) => {
	return <div className="reorder-list">{children}</div>;
});

const SortablePhoto = sortableElement(item => <Photo {...item} />);
const SortableGalleryEdit = sortableContainer(({ items, onGridRemoveClick }) => (
	<Gallery photos={items} renderImage={props => <SortablePhoto indexkey={props.index} onGridRemoveClick={onGridRemoveClick} {...props} />} />
));
const SortableGalleryView = sortableContainer(({ items }) => (
	<Gallery photos={items} />
));


function GalleryDesign() {
	const inputFile = useRef(null);
	const inputFileVideo = useRef(null);
	const [loader, setLoader] = useState(false);
	const [editGalleryId, seteditGalleryId] = useState('');
	const [mediaType, setMediaType] = useState("");
	const [ImageInsert, setImageInsert] = useState(true);
	const [positionset, setPositionset] = useState("");
	const [positionIndexset, setPositionIndexset] = useState("");
	const [modalSpacing, setModalSpacing] = useState(false);
	const [modalReorder, setModalReorder] = useState(false);
	const [rangeval, setRangeval] = useState(42);
	const [divspacingChange, setDivspacingChange] = useState("42");
	const [newDesignFieldsArray, setnewDesignFieldsArray] = useState([]);
	const [newDesignFieldsortingArray, setnewDesignFieldsortingArray] = useState([]);
	const [newDesignEditGalleryGrid, setnewDesignEditGalleryGrid] = useState([]);

	var stylingObject = {
		separate_module: {
			height: rangeval + 'px'
		},
		pointerEvents: {
			'pointer-events': 'none'
		}
	}
	useEffect(() => {
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	function handleResize() {
		var gallery_div = $('.gallery-gallery-div').width();
		$('.gallery-gallery-div').css('height', gallery_div + 'px');
	}
	const handleFileUpload = async (e) => {
		setLoader(true)
		var checkLenght = e.target.files.length;
		const newDesignFieldsArrayValues = [...newDesignFieldsArray];
		if (checkLenght) {
			const filearr = Array.from(e.target.files);
			var gridImageArray = [];
			var new_arr = filearr.map(async function (item, key) {
				
				var images = URL.createObjectURL(item);
				if (mediaType === "Image") {
						gridImageArray.push(images);
				} else if (mediaType === "Grid") {
					var imageHeightWidthSet = await imageHeightWidth(images);
						imageHeightWidthSet["src"] = images;
						gridImageArray.push(imageHeightWidthSet);
				} else {
						handleAdd(images, mediaType, positionset, positionIndexset, newDesignFieldsArrayValues);
				}
			});
			if (gridImageArray !== null) {
				await Promise.all(new_arr).then((e) => {
					if (mediaType === "Grid") {
						handleAdd(gridImageArray, mediaType, positionset, positionIndexset, newDesignFieldsArrayValues);
					} else if (mediaType === "Image") {
						handleAdd(gridImageArray, mediaType, positionset, positionIndexset, newDesignFieldsArrayValues);
					}
				})
			}

		}
	};

	const imageHeightWidth = async (images) => {
		return new Promise((resolve) => {
			var theImage = new Image();
			theImage.onload = async function () {
				var imgwidth = theImage.width;
				var imgheight = theImage.height;
				var arr = {
					width: imgwidth,
					height: imgheight
				}
				resolve(arr);
			}
			theImage.src = images;
		});
	}

	const handleAdd = async (images, mediaType, positionset, positionIndexset, newDesignFieldsArrayValues) => {

		setImageInsert(false);
		if (mediaType === "Image") {
			for (let i = 0; i < images.length; i++) {
				var myArrayChange = { ImagePreview: images[i], mediaTypes: mediaType }
				var index = 0;
				if (positionset == 'top') {
					index = positionIndexset
				} else {
					index = positionIndexset + 1;
				}
				Array.prototype.insert = function (index, item) {
					this.splice(index, 0, item);
				};
				var myArrayChangeValue = { data: myArrayChange };
				newDesignFieldsArrayValues.insert(index, myArrayChangeValue);
			}
		} else {
			var myArrayChange = { ImagePreview: images, mediaTypes: mediaType }
			var index = 0;
			if (positionset == 'top') {
				index = positionIndexset
			} else {
				index = positionIndexset + 1;
			}
			Array.prototype.insert = function (index, item) {
				this.splice(index, 0, item);
			};
			var myArrayChangeValue = { data: myArrayChange };
			newDesignFieldsArrayValues.insert(index, myArrayChangeValue);
		}
		setnewDesignFieldsArray(newDesignFieldsArrayValues);
		setLoader(false)

	}
	const onButtonClick = (type, position, index) => {
		handleClickOutside();
		setMediaType(type);
		setPositionset(position);
		setPositionIndexset(index);
		const values = [...newDesignFieldsArray];
		// only keep items that are the empty string
		var new_arr = values.filter(function (item) {
			if (item.data.mediaTypes == "Text") {
				if (!item.data.inputValue) {
					item = null;
				}
			}
			return item;
		})
		setnewDesignFieldsArray(new_arr);
	
		if (type == "Text") {
			handleAdd("", type, position, index, new_arr);
		} else if (type == "Video") {
			inputFileVideo.current.click();
		} else {
			inputFile.current.click();
		}
	};
	const handleClickOutside = (e) => {
		$(".dropdown-list").removeClass("active");

	};


	const handleFileAddGridList = async (e) => {
		let currentTarget = e.target;
		handleClickOutside();
		var gridImageArray = [];
		var checkLenght = e.target.files.length;
		if (checkLenght) {
			const filearr = Array.from(e.target.files);
			var gridImageArray = [];
			var new_arr = filearr.map(async function (item, key) {
				var images = URL.createObjectURL(item);
				var imageHeightWidthSet = await imageHeightWidth(images);
					imageHeightWidthSet["src"] = images;
					gridImageArray.push(imageHeightWidthSet);
			});
			if (gridImageArray !== null) {
				await Promise.all(new_arr).then((e) => {
					setnewDesignEditGalleryGrid(newDesignEditGalleryGrid.concat(gridImageArray));
				})
			}
		}
	};

	const handleClickGridSaveCancel = (e) => {
		if (e == "yes") {
			const newDesignFieldsArrayValues = [...newDesignFieldsArray];
			newDesignFieldsArrayValues[editGalleryId].data.ImagePreview = newDesignEditGalleryGrid;
			setnewDesignFieldsArray(newDesignFieldsArrayValues);
			seteditGalleryId('');
			setnewDesignEditGalleryGrid([]);
		} else {
			seteditGalleryId('');
			setnewDesignEditGalleryGrid([]);
		}
	};

	
	function handleInputTextReplace(textContent, i) {
		const newDesignFieldsArrayValues = [...newDesignFieldsArray];
		newDesignFieldsArrayValues[i].data.inputValue = textContent;
		setnewDesignFieldsArray(newDesignFieldsArrayValues);
	}

	const handleReorderSet = (fieldsarray) => {
		setnewDesignFieldsortingArray(fieldsarray);
		setModalReorder(true);
		handleClickOutside();
	}

	function handleInputTextFocus(id) {
		handleClick(id);
		$('#input-' + id).focus();
	}
	function handleInputGridEdit(id) {
		const newDesignFieldsArrayValues = [...newDesignFieldsArray];
		setnewDesignEditGalleryGrid(newDesignFieldsArrayValues[id].data.ImagePreview);
		seteditGalleryId(id);
		handleClickOutside();
	}
	const handleClick = (e) => {
		if ($(".open-dropdown-list-" + e).hasClass("active")) {
			$(".dropdown-list").removeClass("active");
		} else {
			$(".dropdown-list").removeClass("active");
			$(".open-dropdown-list-" + e).addClass("active");
		}

	};

	const gridImageRemove = e => {
		var gridImageArray = [];
		let currentTarget = e.target;
		e.target.parentNode.classList.add('fadeOut');
		let currentId = currentTarget.getAttribute('data-id');
		newDesignEditGalleryGrid.splice(currentId, 1);
		setnewDesignEditGalleryGrid(newDesignEditGalleryGrid.concat(gridImageArray));
		if (newDesignEditGalleryGrid.length == 0) {
		}
	}

	const onSortEndGallery = ({ oldIndex, newIndex }) => {
		setnewDesignEditGalleryGrid(arrayMove(newDesignEditGalleryGrid, oldIndex, newIndex));
	};

	const handleFileUploadReplace = async (e) => {
		let currentTarget = e.target;
		let currentId = currentTarget.getAttribute('data-id');
		handleClick(currentId);
		const newDesignFieldsArrayValues = [...newDesignFieldsArray];
		if (e.target.files.length) {
			var eventFile = e.target.files[0];
			var images = URL.createObjectURL(eventFile);
			newDesignFieldsArrayValues[currentId].data.ImagePreview = images;
		
			setnewDesignFieldsArray(newDesignFieldsArrayValues);
		}
	};

	function handleRemove(i) {
		handleClickOutside();
		const newDesignFieldsArrayValues = [...newDesignFieldsArray];
		newDesignFieldsArrayValues.splice(i, 1);
		setnewDesignFieldsArray(newDesignFieldsArrayValues);
		if (newDesignFieldsArrayValues.length == 0) {
			setImageInsert(true);
		}
		setTimeout(() => {
			handleResize();
		}, 100);
		
	}

	const setRangevalChange = e => {
		var value = e.target.value;
		setRangeval(value);

	};
	const handleClickSpacingSetOrNot = (e) => {
		setModalSpacing(false)
		if (e == "yes") {
			setDivspacingChange(rangeval)
		} else {
			setRangeval(divspacingChange)
		}
	}

	const onSortEnd = ({ oldIndex, newIndex }) => {
		var newArray = arrayMove(newDesignFieldsArray, oldIndex, newIndex);
		setnewDesignFieldsortingArray(newArray);
	};

	const handleClickReorderSetOrNot = (e) => {
		setModalReorder(false);
		if (e == "yes") {
			setnewDesignFieldsArray(newDesignFieldsortingArray);
		} else {
			setnewDesignFieldsortingArray([]);
		}
	}
	return (
		<div className="App">
			<div className="gallery-create-new-design-wrapper">
				<div className="gallery-create-new-design-header">
					<h4>Your Gallery</h4>
				</div>
				<div className="container-fluid">
					<div className="gallery-create-new-design-wrapper-div">
						<form method="post" action="">
							<div className="row">
								<div className="col-md-12 col-sm-12 col-xs-12">
									<div className="gallery-create-new-design-gallery-container">
										<input style={{ display: "none" }} ref={inputFile}
											onChange={e => {
												handleFileUpload(e)
												e.target.value = null
											}
											}
											type="file" accept="image/*" multiple />
										<input style={{ display: "none" }} ref={inputFileVideo}
											onChange={e => {
												handleFileUpload(e)
												e.target.value = null
											}
											}
											type="file" accept="video/*" />

										{ImageInsert ? (
											<div className="gallery-create-new-design-gallery-form">
												<div className="gallery-create-new-design-gallery-div">
													<div className="gallery-gallery-div" onClick={e => onButtonClick('Image', 'top', '0')}>
														<img src={process.env.PUBLIC_URL + "/assets/images/image.svg"}
															alt=""
														/>
													</div>
													<div className="gallery-gallery-div" onClick={e => onButtonClick('Video', 'top', '0')}>
														<img src={process.env.PUBLIC_URL + "/assets/images/video.svg"}
															alt=""
														/>
													</div>
													<div className="gallery-gallery-div" onClick={e => onButtonClick('Text', 'top', '0')}>
														<img src={process.env.PUBLIC_URL + "/assets/images/text.svg"}
															alt=""
														/>
													</div>
													<div className="gallery-gallery-div" onClick={e => onButtonClick('Grid', 'top', '0')}>
														<i class="fa fa-th-large"></i>
													</div>
												</div>
												<div className="gallery-create-new-design-gallery-div">
													<div className="gallery-gallery-text-div">
													IMAGE
													</div>
													<div className="gallery-gallery-text-div">
													VIDEO
													</div>
													<div className="gallery-gallery-text-div">
													TEXT
													</div>
													<div className="gallery-gallery-text-div">
													PHOTO GRID
													</div>
												</div>
											</div>
										) : null}

										{newDesignFieldsArray.map((field, idx) => {
											var idx = idx;
											var value = field.data;
											return (
												<div key={`${value}-${idx}`} className="gallery-gallery-insert-div-section">
													{idx === 0 ? (
														<div className="gallery-gallery-hover-container" style={stylingObject.separate_module}>
															<div className={`gallery-gallery-hover-section`}>
																<div className="gallery-gallery-hover-div">

																	<div className="inser-media-div">Insert Media</div>
																	<div className="inser-media-div" onClick={e => onButtonClick('Image', 'top', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/image.svg"}
																		alt=""
																	/></div>
																	<div className="inser-media-div" onClick={e => onButtonClick('Video', 'top', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/video.svg"}
																		alt=""
																	/></div>
																	<div className="inser-media-div" onClick={e => onButtonClick('Text', 'top', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/text.svg"}
																		alt=""
																	/></div>
																	<div className="inser-media-div" onClick={e => onButtonClick('Grid', 'top', idx)}>
																		<i class="fa fa-th-large"></i>
																	</div>

																</div>
															</div>
														</div>
													) : null}
													<div className={`gallery-gallery-insert-div ${value.mediaTypes == 'Grid' ? '' : 'padding'}`}>

														<picture>
															{value.ImagePreview && value.mediaTypes === "Video" ? (
																<video src={value.ImagePreview} width="750" height="500" controls>
																</video>
															) : null}
															{value.ImagePreview && value.mediaTypes === "Image" ? (
																<img src={value.ImagePreview} className="single-img" />
															) : null}

															{value.mediaTypes == "Grid" ? (
																<div className="gallery-gallery-grid-margin">
																	{editGalleryId === idx && editGalleryId !== "" ? (
																		<div className="react-photo-gallery-gallery-edit-grid">
																			<div className="gallery-create-new-design-gallery-div-edit-grid">
																				<h2 className="gallery-create-new-design-gallery-div-edit-grid-header">
																					<p>Edit Grid</p>
																					<div className="header-button-div">
																						<button type="button" className="button-add-photos">
																							<label htmlFor={`add-grid-photo-${idx}`}>
																								Add Photos
																								<input id={`add-grid-photo-${idx}`} style={{ display: "none" }} data-id={`${idx}`} type="file"
																									onChange={e => {
																										handleFileAddGridList(e)
																										e.target.value = null
																									}
																									}
																									accept="image/*" multiple></input>
																							</label>
																						</button>
																						<button className="button-save" onClick={() => handleClickGridSaveCancel('yes')}>save</button>
																						<button className="button-cancel" onClick={() => handleClickGridSaveCancel('no')}>cancel</button>
																					</div>
																				</h2>
																			</div>
																			<SortableGalleryEdit items={newDesignEditGalleryGrid} onGridRemoveClick={gridImageRemove} onSortEnd={onSortEndGallery} axis={"xy"} />
																		</div>
																	) : (
																		<SortableGalleryView items={value.ImagePreview} />
																	)}
																</div>
															) : null}

															{value.mediaTypes == "Text" ? (
																<Editor
																	editorState={value.inputValue}
																	onEditorStateChange={(e) => handleInputTextReplace(e, idx)}
																	wrapperClassName="wrapperClassName"
																	editorClassName="editorClassName"
																	toolbarClassName="toolbar-class"
																	toolbar={{
																		options: ['inline', 'list', 'textAlign'],
																		inline: {
																			options: ['bold', 'italic', 'underline'],
																		},
																		list: {
																			options: ['unordered', 'ordered', 'indent', 'outdent'],
																		},
																		textAlign: {
																			options: ['left', 'center', 'right'],
																		},
																	}}
																/>
															) : null}
														</picture>
														<div className={`edit-button-section ${value.mediaTypes == 'Text' ? ('text') : ''}`}>

															<div className={`open-dropdown-list-${idx} dropdown-list`}>
																<ul>
																	<li>
																		<a href="javascript:" onClick={() => handleReorderSet(newDesignFieldsArray)}><h4>reorder</h4></a>
																		<hr />
																	</li>
																	<li>
																		{value.mediaTypes == "Text" ? (
																			<h4 onClick={e => handleInputTextFocus(idx)}>Edit Text</h4>
																		) : null}
																		{value.mediaTypes == "Grid" ? (
																			<h4 onClick={e => handleInputGridEdit(idx)}>Edit Grid</h4>
																		) : null}
																		{value.mediaTypes == "Image" || value.mediaTypes == "Video" ? (
																			<h4>
																				<label htmlFor={`filePicker-${idx}`}>
																					Replace
																					<input id={`filePicker-${idx}`} style={{ display: "none" }} data-id={`${idx}`} type="file"
																						onChange={e => {
																							handleFileUploadReplace(e)
																							e.target.value = null
																						}
																						}
																						accept={`${value.mediaTypes == "Video" ? "video/*" : "image/*"}`}></input>
																				</label>
																			</h4>
																		) : null}
																		<hr />
																	</li>
																	<li>
																		<a href="javascript:" onClick={() => handleRemove(idx)}><h4>delete</h4></a>
																		<hr />
																	</li>
																	<li>
																		<a href="javascript:" onClick={() => {
																			setModalSpacing(true)
																			handleClick(idx)
																		}}><h4>spacing</h4></a>
																	</li>
																</ul>
															</div>

															<button type="button" className="edit-button" onClick={e => handleClick(idx)}>
																<img alt="" src={process.env.PUBLIC_URL + "/assets/images/edit.svg"} />
															</button>

														</div>
													</div>

													<div className="gallery-gallery-hover-container" style={stylingObject.separate_module}>
														<div className={`gallery-gallery-hover-section`}>
															<div className="gallery-gallery-hover-div">

																<div className="inser-media-div">Insert Media</div>
																<div className="inser-media-div" onClick={e => onButtonClick('Image', 'bottom', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/image.svg"}
																	alt=""
																/></div>
																<div className="inser-media-div" onClick={e => onButtonClick('Video', 'bottom', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/video.svg"}
																	alt=""
																/></div>
																<div className="inser-media-div" onClick={e => onButtonClick('Text', 'bottom', idx)}><img src={process.env.PUBLIC_URL + "/assets/images/text.svg"}
																	alt=""
																/></div>
																<div className="inser-media-div" onClick={e => onButtonClick('Grid', 'bottom', idx)}>
																	<i class="fa fa-th-large"></i>
																</div>

															</div>
														</div>
													</div>
												</div>

											);
										})}

									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>

			
			<Modal
				show={modalSpacing}
				className="gallery-create-new-design-wrapper-modal-spacing"
				aria-labelledby="contained-modal-title-vcenter"
			>
				<Modal.Header><h4>Project Styles</h4></Modal.Header>
				<div className="gallery-create-new-design-content-spacing">
					<div className="range-slider-lable-left">Content Spacing</div>
					<div className="ange-slider-lable-right">
						<label className="range-slider-lable-right-label1">
							<div className="range-slider-input-div">
								<div className="range-slider-input-line"></div>

								<input type="range" min="0" max="150"
									defaultValue={rangeval}
									step="1"
									onChange={(event) => setRangevalChange(event)} />
							</div>
						</label>
						<label className="range-slider-lable-right-label2">
							<input type="text" min="0" max="150" step="1" tabindex="0" value={rangeval} disabled />
							<span>px</span>
						</label>
					</div>
				</div>
				<div className="modal-footer">
					<button className="button-save" onClick={() => handleClickSpacingSetOrNot('yes')}>save</button>
					<button className="button-cancel" onClick={() => handleClickSpacingSetOrNot('no')}>cancel</button>
				</div>
			</Modal>

			<Modal
				show={modalReorder}
				className="gallery-create-new-design-wrapper-modal-reorder"
				aria-labelledby="contained-modal-title-vcenter"
			>
				<Modal.Header><h4>Reorder content</h4></Modal.Header>
				<div className="gallery-create-new-design-content-reorder">
					<SortableContainer onSortEnd={onSortEnd} useDragHandle>

						{newDesignFieldsortingArray.map((value, index) => (
							<SortableItem key={`item-${index}`} index={index} field={value} />
						))}
					</SortableContainer>
				</div>
				<div className="modal-footer">
					<button className="button-save" onClick={() => handleClickReorderSetOrNot('yes')}>save</button>
					<button className="button-cancel" onClick={() => handleClickReorderSetOrNot('no')}>cancel</button>
				</div>
			</Modal>
			{editGalleryId !== "" ? (
				<div className="grid-overlay"></div>
			) : null}
		</div>

		
	);
}

export default GalleryDesign;
